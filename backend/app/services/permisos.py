"""Reglas de acceso por rol (propuesta pendiente de confirmar por el equipo).

- administrador: todo, incluida la gestión de usuarios.
- supervisor: ve todos los reclamos, asigna, cambia estados y anula.
- funcionario: registra reclamos y trabaja los asignados a él; ve además los que registró.
"""

from app.core.errores import NoEncontrado, PermisoDenegado
from app.domain.entidades import Reclamo, Usuario
from app.domain.enums import Rol

GESTORES = frozenset({Rol.ADMINISTRADOR, Rol.SUPERVISOR})


def es_gestor(usuario: Usuario) -> bool:
    return usuario.rol in GESTORES


def exigir_rol(usuario: Usuario, *roles: Rol) -> None:
    if usuario.rol not in roles:
        raise PermisoDenegado("Tu rol no permite realizar esta acción.")


def puede_ver(usuario: Usuario, reclamo: Reclamo) -> bool:
    return es_gestor(usuario) or usuario.id in (reclamo.funcionario_id, reclamo.registrado_por_id)


def exigir_visible(usuario: Usuario, reclamo: Reclamo | None) -> Reclamo:
    """Responde 404 tanto si no existe como si no es visible, para no revelar su existencia."""
    if reclamo is None or not puede_ver(usuario, reclamo):
        raise NoEncontrado("Reclamo no encontrado.")
    return reclamo


def exigir_operable(usuario: Usuario, reclamo: Reclamo) -> None:
    """Gestionar un reclamo: gestores o el funcionario asignado."""
    if not (es_gestor(usuario) or reclamo.funcionario_id == usuario.id):
        raise PermisoDenegado("Solo el funcionario asignado o un supervisor puede gestionarlo.")
