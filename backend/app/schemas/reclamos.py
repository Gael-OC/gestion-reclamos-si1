from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from app.domain.enums import CanalIngreso, EstadoReclamo, SituacionPlazo, TipoEvento
from app.schemas.usuarios import UsuarioResumen
from app.schemas.validadores import Correo, Rut

TextoCorto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=160)]
TextoLargo = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=10, max_length=5000)
]
Comentario = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]
Telefono = Annotated[str, StringConstraints(strip_whitespace=True, pattern=r"^\+?[\d\s-]{8,20}$")]


class _DatosReclamo(BaseModel):
    consumidor_nombre: TextoCorto
    consumidor_rut: Rut | None = None
    consumidor_correo: Correo | None = None
    consumidor_telefono: Telefono | None = None
    empresa_nombre: TextoCorto
    empresa_rut: Rut | None = None
    categoria: TextoCorto = Field(examples=["Telecomunicaciones"])
    descripcion: TextoLargo


class ReclamoCrear(_DatosReclamo):
    canal: CanalIngreso = CanalIngreso.PRESENCIAL


class ReclamoActualizar(BaseModel):
    """Corrige datos del reclamo. Solo se modifican los campos enviados."""

    consumidor_nombre: TextoCorto | None = None
    consumidor_rut: Rut | None = None
    consumidor_correo: Correo | None = None
    consumidor_telefono: Telefono | None = None
    empresa_nombre: TextoCorto | None = None
    empresa_rut: Rut | None = None
    categoria: TextoCorto | None = None
    descripcion: TextoLargo | None = None


class PlazoLeer(BaseModel):
    fecha_limite: date
    dias_transcurridos: int = Field(description="Días corridos desde el ingreso (hasta el cierre).")
    dias_restantes: int | None = Field(
        description="Días corridos hasta la fecha límite; negativo si venció. Nulo si terminó."
    )
    situacion: SituacionPlazo


class ReclamoResumen(BaseModel):
    """Fila del listado de reclamos."""

    id: int
    folio: str
    estado: EstadoReclamo
    consumidor_nombre: str
    empresa_nombre: str
    categoria: str
    canal: CanalIngreso
    fecha_ingreso: datetime
    funcionario: UsuarioResumen | None
    plazo: PlazoLeer


class ReclamoDetalle(ReclamoResumen):
    consumidor_rut: str | None
    consumidor_correo: str | None
    consumidor_telefono: str | None
    empresa_rut: str | None
    descripcion: str
    registrado_por: UsuarioResumen | None
    fecha_cierre: datetime | None
    resultado: str | None
    actualizado_en: datetime


class CambioEstadoSolicitud(BaseModel):
    estado: EstadoReclamo
    comentario: Comentario | None = Field(
        default=None,
        description="Obligatorio para cerrar, anular o pedir antecedentes.",
    )


class GestionSolicitud(BaseModel):
    descripcion: Comentario = Field(examples=["Se envió oficio a la empresa por correo."])


class AsignacionSolicitud(BaseModel):
    funcionario_id: int
    motivo: Comentario | None = None


class EventoLeer(BaseModel):
    id: int
    tipo: TipoEvento
    fecha: datetime
    usuario: UsuarioResumen | None
    detalle: str | None
    estado_anterior: EstadoReclamo | None
    estado_nuevo: EstadoReclamo | None
    funcionario_anterior: UsuarioResumen | None
    funcionario_nuevo: UsuarioResumen | None


class ResumenPlazos(BaseModel):
    """Conteos a la fecha de corte sobre los reclamos visibles para el usuario."""

    fecha_corte: date
    activos: int
    sin_asignar: int
    en_plazo: int
    por_vencer: int
    vencidos: int
