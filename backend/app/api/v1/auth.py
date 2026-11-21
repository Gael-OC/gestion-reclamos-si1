from fastapi import APIRouter

from app.api.deps import AuthDep, UsuarioActual
from app.schemas.auth import LoginSolicitud, TokenRespuesta
from app.schemas.comunes import ErrorRespuesta
from app.schemas.usuarios import UsuarioLeer

router = APIRouter(prefix="/auth", tags=["autenticación"])


@router.post(
    "/login",
    response_model=TokenRespuesta,
    responses={401: {"model": ErrorRespuesta, "description": "Credenciales inválidas"}},
)
def login(datos: LoginSolicitud, auth: AuthDep) -> TokenRespuesta:
    """Inicia sesión y entrega un token Bearer para el encabezado `Authorization`."""
    token, usuario = auth.iniciar_sesion(datos.correo, datos.contrasena)
    return TokenRespuesta(
        access_token=token.access_token,
        expira_en=token.expira_en,
        usuario=UsuarioLeer.model_validate(usuario),
    )


@router.get("/me", response_model=UsuarioLeer)
def usuario_actual(usuario: UsuarioActual) -> UsuarioLeer:
    """Datos del usuario autenticado; útil para que el frontend conozca su rol."""
    return UsuarioLeer.model_validate(usuario)
