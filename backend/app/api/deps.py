"""Dependencias compartidas por los routers: datos, servicios y usuario autenticado."""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.presentacion import Presentador
from app.core.config import Settings
from app.core.errores import NoAutenticado
from app.core.reloj import Reloj
from app.domain.entidades import Usuario
from app.domain.enums import Rol
from app.repositories.base import Repositorios
from app.services import permisos
from app.services.asignaciones import ServicioAsignaciones
from app.services.auth import ServicioAuth
from app.services.base import Servicio
from app.services.control_plazos import ServicioPlazos
from app.services.reclamos import ServicioReclamos
from app.services.usuarios import ServicioUsuarios

_bearer = HTTPBearer(auto_error=False, description="Token obtenido en POST /api/v1/auth/login")


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_reloj(request: Request) -> Reloj:
    return request.app.state.reloj


def get_repositorios(request: Request) -> Repositorios:
    """Punto único donde se decide el origen de los datos.

    Con almacenamiento "sql", esta función debe crear los repositorios a partir de
    una sesión (ver `app.db.session.get_db`) y confirmar la transacción al final de
    la solicitud. Los servicios y routers no cambian.
    """
    return request.app.state.almacen.repositorios()


Repos = Annotated[Repositorios, Depends(get_repositorios)]
RelojDep = Annotated[Reloj, Depends(get_reloj)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


def _servicio[S: Servicio](clase: type[S]) -> Callable[..., S]:
    def crear(repos: Repos, reloj: RelojDep, settings: SettingsDep) -> S:
        return clase(repos, reloj, settings)

    return crear


AuthDep = Annotated[ServicioAuth, Depends(_servicio(ServicioAuth))]
UsuariosDep = Annotated[ServicioUsuarios, Depends(_servicio(ServicioUsuarios))]
ReclamosDep = Annotated[ServicioReclamos, Depends(_servicio(ServicioReclamos))]
AsignacionesDep = Annotated[ServicioAsignaciones, Depends(_servicio(ServicioAsignaciones))]
PlazosDep = Annotated[ServicioPlazos, Depends(_servicio(ServicioPlazos))]


def get_presentador(repos: Repos, plazos: PlazosDep) -> Presentador:
    return Presentador(repos, plazos)


PresentadorDep = Annotated[Presentador, Depends(get_presentador)]


def get_usuario_actual(
    auth: AuthDep,
    credenciales: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> Usuario:
    if credenciales is None or credenciales.scheme.lower() != "bearer":
        raise NoAutenticado("Falta el token de acceso.")
    return auth.usuario_desde_token(credenciales.credentials)


UsuarioActual = Annotated[Usuario, Depends(get_usuario_actual)]


def requiere_roles(*roles: Rol) -> Callable[[Usuario], Usuario]:
    def verificar(usuario: UsuarioActual) -> Usuario:
        permisos.exigir_rol(usuario, *roles)
        return usuario

    return verificar


Gestor = Annotated[Usuario, Depends(requiere_roles(Rol.ADMINISTRADOR, Rol.SUPERVISOR))]
Administrador = Annotated[Usuario, Depends(requiere_roles(Rol.ADMINISTRADOR))]
