from dataclasses import dataclass
from datetime import date, datetime

from app.domain.enums import CanalIngreso, EstadoReclamo, Rol, TipoEvento


@dataclass(slots=True)
class Usuario:
    id: int
    nombre: str
    correo: str
    rol: Rol
    hash_contrasena: str
    activo: bool = True


@dataclass(slots=True)
class Reclamo:
    """Reclamo de un consumidor. Campos propuestos; el modelo lógico lo define el equipo de BD."""

    id: int
    folio: str
    consumidor_nombre: str
    empresa_nombre: str
    categoria: str
    descripcion: str
    canal: CanalIngreso
    estado: EstadoReclamo
    registrado_por_id: int
    fecha_ingreso: datetime
    fecha_limite: date
    actualizado_en: datetime
    consumidor_rut: str | None = None
    consumidor_correo: str | None = None
    consumidor_telefono: str | None = None
    empresa_rut: str | None = None
    funcionario_id: int | None = None
    fecha_cierre: datetime | None = None
    resultado: str | None = None


@dataclass(slots=True)
class EventoSeguimiento:
    """Registro inmutable del historial de un reclamo (trazabilidad)."""

    id: int
    reclamo_id: int
    tipo: TipoEvento
    fecha: datetime
    usuario_id: int
    detalle: str | None = None
    estado_anterior: EstadoReclamo | None = None
    estado_nuevo: EstadoReclamo | None = None
    funcionario_anterior_id: int | None = None
    funcionario_nuevo_id: int | None = None
