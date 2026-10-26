"""Gestión y seguimiento de reclamos."""

from collections.abc import Sequence
from dataclasses import dataclass

from app.core.errores import Conflicto, ReglaNegocio
from app.domain.entidades import EventoSeguimiento, Reclamo, Usuario
from app.domain.enums import (
    ESTADOS_ACTIVOS,
    EstadoReclamo,
    Rol,
    SituacionPlazo,
    TipoEvento,
)
from app.repositories.base import FiltroReclamos, OrdenReclamos
from app.schemas.reclamos import ReclamoActualizar, ReclamoCrear
from app.services import permisos
from app.services.base import Servicio
from app.services.flujo_estados import validar_transicion
from app.services.plazos import calcular_fecha_limite, rango_fecha_limite


@dataclass(slots=True)
class CriteriosListado:
    estados: Sequence[EstadoReclamo] = ()
    funcionario_id: int | None = None
    sin_asignar: bool = False
    situacion_plazo: SituacionPlazo | None = None
    texto: str | None = None
    orden: OrdenReclamos = "fecha_ingreso_desc"
    pagina: int = 1
    por_pagina: int = 20


class ServicioReclamos(Servicio):
    # ---- Consultas -------------------------------------------------------------

    def obtener(self, reclamo_id: int, usuario: Usuario) -> Reclamo:
        return permisos.exigir_visible(usuario, self.repos.reclamos.obtener(reclamo_id))

    def listar(self, criterios: CriteriosListado, usuario: Usuario) -> tuple[list[Reclamo], int]:
        filtro = self.filtro_base(usuario)
        filtro.estados = list(criterios.estados)
        filtro.funcionario_id = criterios.funcionario_id
        filtro.sin_asignar = criterios.sin_asignar
        filtro.texto = criterios.texto
        filtro.orden = criterios.orden
        filtro.desplazamiento = (criterios.pagina - 1) * criterios.por_pagina
        filtro.limite = criterios.por_pagina
        if criterios.situacion_plazo is not None:
            self._aplicar_situacion(filtro, criterios.situacion_plazo)
        return self.repos.reclamos.buscar(filtro)

    def filtro_base(self, usuario: Usuario) -> FiltroReclamos:
        """Filtro que restringe a lo que el usuario puede ver."""
        filtro = FiltroReclamos()
        if not permisos.es_gestor(usuario):
            filtro.visible_para_usuario_id = usuario.id
        return filtro

    def _aplicar_situacion(self, filtro: FiltroReclamos, situacion: SituacionPlazo) -> None:
        if situacion in (
            SituacionPlazo.CERRADO_EN_PLAZO,
            SituacionPlazo.CERRADO_FUERA_DE_PLAZO,
            SituacionPlazo.NO_APLICA,
        ):
            raise ReglaNegocio("Solo se puede filtrar por en_plazo, por_vencer o vencido.")
        activos = ESTADOS_ACTIVOS
        filtro.estados = [e for e in filtro.estados if e in activos] or sorted(activos)
        filtro.fecha_limite_desde, filtro.fecha_limite_hasta = rango_fecha_limite(
            situacion, self.reloj.hoy(), self.settings.dias_alerta
        )

    def seguimiento(self, reclamo_id: int, usuario: Usuario) -> list[EventoSeguimiento]:
        self.obtener(reclamo_id, usuario)
        return self.repos.eventos.listar_por_reclamo(reclamo_id)

    # ---- Comandos --------------------------------------------------------------

    def crear(self, datos: ReclamoCrear, usuario: Usuario) -> Reclamo:
        ahora = self.reloj.ahora()
        fecha_local = self.reloj.fecha_local(ahora)
        reclamo = self.repos.reclamos.crear(
            Reclamo(
                id=0,
                folio="",
                **datos.model_dump(),
                estado=EstadoReclamo.INGRESADO,
                registrado_por_id=usuario.id,
                fecha_ingreso=ahora,
                fecha_limite=calcular_fecha_limite(fecha_local, self.settings.plazo_dias),
                actualizado_en=ahora,
            )
        )
        reclamo.folio = f"R-{fecha_local.year}-{reclamo.id:06d}"
        reclamo = self.repos.reclamos.guardar(reclamo)
        self.registrar_evento(reclamo, usuario, TipoEvento.CREACION, "Reclamo registrado.")
        return reclamo

    def actualizar(self, reclamo_id: int, datos: ReclamoActualizar, usuario: Usuario) -> Reclamo:
        reclamo = self._operable(reclamo_id, usuario)
        cambios = datos.model_dump(exclude_unset=True)
        obligatorios = {"consumidor_nombre", "empresa_nombre", "categoria", "descripcion"}
        cambios = {
            campo: valor
            for campo, valor in cambios.items()
            if getattr(reclamo, campo) != valor and not (valor is None and campo in obligatorios)
        }
        if not cambios:
            return reclamo
        for campo, valor in cambios.items():
            setattr(reclamo, campo, valor)
        reclamo.actualizado_en = self.reloj.ahora()
        reclamo = self.repos.reclamos.guardar(reclamo)
        detalle = "Campos actualizados: " + ", ".join(sorted(cambios)) + "."
        self.registrar_evento(reclamo, usuario, TipoEvento.ACTUALIZACION, detalle)
        return reclamo

    def cambiar_estado(
        self, reclamo_id: int, nuevo: EstadoReclamo, comentario: str | None, usuario: Usuario
    ) -> Reclamo:
        reclamo = self._operable(reclamo_id, usuario)
        if nuevo == EstadoReclamo.ANULADO:
            permisos.exigir_rol(usuario, Rol.ADMINISTRADOR, Rol.SUPERVISOR)
        if nuevo == EstadoReclamo.ASIGNADO:
            raise Conflicto("Para asignar un reclamo usa el endpoint de asignación.")
        validar_transicion(reclamo, nuevo, comentario)

        anterior = reclamo.estado
        ahora = self.reloj.ahora()
        reclamo.estado = nuevo
        reclamo.actualizado_en = ahora
        if nuevo in (EstadoReclamo.CERRADO, EstadoReclamo.ANULADO):
            reclamo.fecha_cierre = ahora
            reclamo.resultado = comentario
        reclamo = self.repos.reclamos.guardar(reclamo)
        self.registrar_evento(
            reclamo,
            usuario,
            TipoEvento.CAMBIO_ESTADO,
            comentario,
            estado_anterior=anterior,
            estado_nuevo=nuevo,
        )
        return reclamo

    def registrar_gestion(
        self, reclamo_id: int, descripcion: str, usuario: Usuario
    ) -> EventoSeguimiento:
        reclamo = self._operable(reclamo_id, usuario)
        reclamo.actualizado_en = self.reloj.ahora()
        self.repos.reclamos.guardar(reclamo)
        return self.registrar_evento(reclamo, usuario, TipoEvento.GESTION, descripcion)

    # ---- Apoyo -----------------------------------------------------------------

    def _operable(self, reclamo_id: int, usuario: Usuario) -> Reclamo:
        reclamo = self.obtener(reclamo_id, usuario)
        permisos.exigir_operable(usuario, reclamo)
        if not reclamo.estado.es_activo:
            raise Conflicto(f"El reclamo está {reclamo.estado} y no admite cambios.")
        return reclamo

    def registrar_evento(
        self,
        reclamo: Reclamo,
        usuario: Usuario,
        tipo: TipoEvento,
        detalle: str | None,
        **extra: object,
    ) -> EventoSeguimiento:
        return self.repos.eventos.agregar(
            EventoSeguimiento(
                id=0,
                reclamo_id=reclamo.id,
                tipo=tipo,
                fecha=self.reloj.ahora(),
                usuario_id=usuario.id,
                detalle=detalle,
                **extra,  # type: ignore[arg-type]
            )
        )
