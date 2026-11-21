from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.domain.enums import Rol
from app.schemas.validadores import Correo

Contrasena = Annotated[str, StringConstraints(min_length=8, max_length=128)]
Nombre = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]


class UsuarioResumen(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    rol: Rol


class UsuarioLeer(UsuarioResumen):
    correo: str
    activo: bool


class UsuarioCrear(BaseModel):
    nombre: Nombre
    correo: Correo
    rol: Rol
    contrasena: Contrasena


class UsuarioActualizar(BaseModel):
    """Solo se modifican los campos enviados."""

    nombre: Nombre | None = None
    rol: Rol | None = None
    activo: bool | None = None
    contrasena: Contrasena | None = None


class CargaFuncionario(BaseModel):
    funcionario: UsuarioResumen
    reclamos_activos: int = Field(
        description="Reclamos asignados que no están cerrados ni anulados."
    )
