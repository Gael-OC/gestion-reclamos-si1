"""Convierte entidades del dominio en los esquemas de respuesta de la API."""

from app.domain.entidades import EventoSeguimiento, Reclamo, Usuario
from app.repositories.base import Repositorios
from app.schemas.reclamos import EventoLeer, PlazoLeer, ReclamoDetalle, ReclamoResumen
from app.schemas.usuarios import UsuarioResumen
from app.services.control_plazos import ServicioPlazos


class Presentador:
    def __init__(self, repos: Repositorios, plazos: ServicioPlazos) -> None:
        self._plazos = plazos
        self._hoy = plazos.reloj.hoy()
        # Los usuarios son pocos: se cargan una vez para resolver nombres sin N consultas.
        self._usuarios = {u.id: u for u in repos.usuarios.listar()}

    def usuario(self, usuario_id: int | None) -> UsuarioResumen | None:
        usuario: Usuario | None = self._usuarios.get(usuario_id) if usuario_id else None
        return UsuarioResumen.model_validate(usuario) if usuario else None

    def plazo(self, reclamo: Reclamo) -> PlazoLeer:
        evaluacion = self._plazos.evaluar(reclamo, self._hoy)
        return PlazoLeer(
            fecha_limite=evaluacion.fecha_limite,
            dias_transcurridos=evaluacion.dias_transcurridos,
            dias_restantes=evaluacion.dias_restantes,
            situacion=evaluacion.situacion,
        )

    def resumen(self, reclamo: Reclamo) -> ReclamoResumen:
        return ReclamoResumen(**self._comunes(reclamo))

    def detalle(self, reclamo: Reclamo) -> ReclamoDetalle:
        return ReclamoDetalle(
            **self._comunes(reclamo),
            consumidor_rut=reclamo.consumidor_rut,
            consumidor_correo=reclamo.consumidor_correo,
            consumidor_telefono=reclamo.consumidor_telefono,
            empresa_rut=reclamo.empresa_rut,
            descripcion=reclamo.descripcion,
            registrado_por=self.usuario(reclamo.registrado_por_id),
            fecha_cierre=reclamo.fecha_cierre,
            resultado=reclamo.resultado,
            actualizado_en=reclamo.actualizado_en,
        )

    def evento(self, evento: EventoSeguimiento) -> EventoLeer:
        return EventoLeer(
            id=evento.id,
            tipo=evento.tipo,
            fecha=evento.fecha,
            usuario=self.usuario(evento.usuario_id),
            detalle=evento.detalle,
            estado_anterior=evento.estado_anterior,
            estado_nuevo=evento.estado_nuevo,
            funcionario_anterior=self.usuario(evento.funcionario_anterior_id),
            funcionario_nuevo=self.usuario(evento.funcionario_nuevo_id),
        )

    def _comunes(self, reclamo: Reclamo) -> dict:
        return {
            "id": reclamo.id,
            "folio": reclamo.folio,
            "estado": reclamo.estado,
            "consumidor_nombre": reclamo.consumidor_nombre,
            "empresa_nombre": reclamo.empresa_nombre,
            "categoria": reclamo.categoria,
            "canal": reclamo.canal,
            "fecha_ingreso": reclamo.fecha_ingreso,
            "funcionario": self.usuario(reclamo.funcionario_id),
            "plazo": self.plazo(reclamo),
        }
