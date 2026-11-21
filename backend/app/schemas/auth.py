from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.usuarios import UsuarioLeer


class LoginSolicitud(BaseModel):
    correo: str
    contrasena: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expira_en: datetime
    usuario: UsuarioLeer
