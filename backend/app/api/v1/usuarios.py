from fastapi import APIRouter, status

from app.api.deps import Administrador, Gestor, UsuariosDep
from app.domain.enums import Rol
from app.schemas.usuarios import UsuarioActualizar, UsuarioCrear, UsuarioLeer

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UsuarioLeer])
def listar_usuarios(
    _: Gestor, servicio: UsuariosDep, rol: Rol | None = None, activo: bool | None = None
) -> list[UsuarioLeer]:
    """Lista usuarios. Con `rol=funcionario&activo=true` entrega los asignables."""
    return [UsuarioLeer.model_validate(u) for u in servicio.listar(rol=rol, activo=activo)]


@router.post("", response_model=UsuarioLeer, status_code=status.HTTP_201_CREATED)
def crear_usuario(datos: UsuarioCrear, _: Administrador, servicio: UsuariosDep) -> UsuarioLeer:
    return UsuarioLeer.model_validate(servicio.crear(datos))


@router.patch("/{usuario_id}", response_model=UsuarioLeer)
def actualizar_usuario(
    usuario_id: int, datos: UsuarioActualizar, actor: Administrador, servicio: UsuariosDep
) -> UsuarioLeer:
    return UsuarioLeer.model_validate(servicio.actualizar(usuario_id, datos, actor))
