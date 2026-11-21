"""Asignación de funcionarios a reclamos y carga de trabajo."""

from app.core.errores import Conflicto, ReglaNegocio
from app.domain.entidades import Reclamo, Usuario
from app.domain.enums import EstadoReclamo, Rol, TipoEvento
from app.services import permisos
from app.services.base import Servicio
from app.services.reclamos import ServicioReclamos


class ServicioAsignaciones(Servicio):
    def asignar(
        self, reclamo_id: int, funcionario_id: int, motivo: str | None, actor: Usuario
    ) -> Reclamo:
        permisos.exigir_rol(actor, Rol.ADMINISTRADOR, Rol.SUPERVISOR)
        reclamos = ServicioReclamos(self.repos, self.reloj, self.settings)
        reclamo = reclamos.obtener(reclamo_id, actor)
        if not reclamo.estado.es_activo:
            raise Conflicto(f"El reclamo está {reclamo.estado} y no admite asignaciones.")

        funcionario = self.repos.usuarios.obtener(funcionario_id)
        if funcionario is None or funcionario.rol != Rol.FUNCIONARIO or not funcionario.activo:
            raise ReglaNegocio("El destinatario debe ser un funcionario activo.")
        if reclamo.funcionario_id == funcionario.id:
            raise Conflicto("El reclamo ya está asignado a ese funcionario.")

        anterior_id = reclamo.funcionario_id
        estado_anterior = reclamo.estado
        reclamo.funcionario_id = funcionario.id
        # Un reclamo recién ingresado pasa a "asignado"; en otros estados se conserva.
        if reclamo.estado == EstadoReclamo.INGRESADO:
            reclamo.estado = EstadoReclamo.ASIGNADO
        reclamo.actualizado_en = self.reloj.ahora()
        reclamo = self.repos.reclamos.guardar(reclamo)

        reclamos.registrar_evento(
            reclamo,
            actor,
            TipoEvento.ASIGNACION if anterior_id is None else TipoEvento.REASIGNACION,
            motivo,
            estado_anterior=estado_anterior if estado_anterior != reclamo.estado else None,
            estado_nuevo=reclamo.estado if estado_anterior != reclamo.estado else None,
            funcionario_anterior_id=anterior_id,
            funcionario_nuevo_id=funcionario.id,
        )
        return reclamo

    def carga(self, actor: Usuario) -> list[tuple[Usuario, int]]:
        """Funcionarios activos con su cantidad de reclamos activos, de mayor a menor."""
        permisos.exigir_rol(actor, Rol.ADMINISTRADOR, Rol.SUPERVISOR)
        conteo = self.repos.reclamos.contar_activos_por_funcionario()
        funcionarios = self.repos.usuarios.listar(rol=Rol.FUNCIONARIO, activo=True)
        filas = [(f, conteo.get(f.id, 0)) for f in funcionarios]
        return sorted(filas, key=lambda fila: (-fila[1], fila[0].nombre))
