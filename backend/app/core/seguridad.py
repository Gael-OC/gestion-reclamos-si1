"""Contraseñas (scrypt de la biblioteca estándar) y tokens de acceso JWT."""

import base64
import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import Settings
from app.core.errores import NoAutenticado
from app.domain.enums import Rol

_N, _R, _P = 2**14, 8, 1
_PREFIJO = "scrypt"


def _b64(datos: bytes) -> str:
    return base64.b64encode(datos).decode("ascii")


def hashear_contrasena(contrasena: str) -> str:
    sal = secrets.token_bytes(16)
    derivada = hashlib.scrypt(contrasena.encode(), salt=sal, n=_N, r=_R, p=_P)
    return f"{_PREFIJO}${_N}${_R}${_P}${_b64(sal)}${_b64(derivada)}"


def verificar_contrasena(contrasena: str, hash_guardado: str) -> bool:
    try:
        prefijo, n, r, p, sal, esperado = hash_guardado.split("$")
        if prefijo != _PREFIJO:
            return False
        derivada = hashlib.scrypt(
            contrasena.encode(),
            salt=base64.b64decode(sal),
            n=int(n),
            r=int(r),
            p=int(p),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(derivada, base64.b64decode(esperado))


@dataclass(frozen=True, slots=True)
class TokenEmitido:
    access_token: str
    expira_en: datetime


def crear_token(usuario_id: int, rol: Rol, settings: Settings) -> TokenEmitido:
    ahora = datetime.now(UTC)
    expira = ahora + timedelta(minutes=settings.jwt_minutos_expiracion)
    carga = {"sub": str(usuario_id), "rol": rol.value, "iat": ahora, "exp": expira}
    token = jwt.encode(
        carga, settings.jwt_secret.get_secret_value(), algorithm=settings.jwt_algoritmo
    )
    return TokenEmitido(access_token=token, expira_en=expira)


def leer_token(token: str, settings: Settings) -> int:
    """Devuelve el id del usuario del token o lanza `NoAutenticado`."""
    try:
        carga = jwt.decode(
            token,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algoritmo],
            options={"require": ["sub", "exp"]},
        )
        return int(carga["sub"])
    except (jwt.PyJWTError, ValueError) as error:
        raise NoAutenticado("Token inválido o expirado.") from error
