"""Interfaces de acceso a datos.

Los servicios dependen solo de estas interfaces. Hoy existe una implementación en
memoria (`memoria.py`); la implementación con PostgreSQL debe cumplir los mismos
métodos (por ejemplo, en `repositories/sql/`) usando los modelos de `app.models`
y convirtiéndolos a las entidades de `app.domain`.
"""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date
from typing import Literal, Protocol

from app.domain.entidades import EventoSeguimiento, Reclamo, Usuario
from app.domain.enums import EstadoReclamo, Rol

OrdenReclamos = Literal[
    "fecha_ingreso_desc", "fecha_ingreso_asc", "fecha_limite_asc", "fecha_limite_desc"
]


@dataclass(slots=True)
class FiltroReclamos:
    """Criterios de búsqueda; todos opcionales y combinables con AND."""

    estados: Sequence[EstadoReclamo] = ()
    funcionario_id: int | None = None
    sin_asignar: bool = False
    # Reclamos visibles para un funcionario: asignados a él o registrados por él.
    visible_para_usuario_id: int | None = None
    fecha_limite_desde: date | None = None
    fecha_limite_hasta: date | None = None
    texto: str | None = None
    orden: OrdenReclamos = "fecha_ingreso_desc"
    desplazamiento: int = 0
    limite: int | None = None


class UsuarioRepository(Protocol):
    def obtener(self, usuario_id: int) -> Usuario | None: ...

    def obtener_por_correo(self, correo: str) -> Usuario | None: ...

    def listar(self, rol: Rol | None = None, activo: bool | None = None) -> list[Usuario]: ...

    def crear(self, usuario: Usuario) -> Usuario:
        """Guarda un usuario nuevo; ignora `usuario.id` y devuelve el usuario con su id."""
        ...

    def guardar(self, usuario: Usuario) -> Usuario: ...


class ReclamoRepository(Protocol):
    def obtener(self, reclamo_id: int) -> Reclamo | None: ...

    def buscar(self, filtro: FiltroReclamos) -> tuple[list[Reclamo], int]:
        """Devuelve la página pedida y el total de coincidencias sin paginar."""
        ...

    def crear(self, reclamo: Reclamo) -> Reclamo:
        """Guarda un reclamo nuevo; ignora `reclamo.id` y devuelve el reclamo con su id."""
        ...

    def guardar(self, reclamo: Reclamo) -> Reclamo: ...

    def contar_activos_por_funcionario(self) -> dict[int, int]: ...


class EventoRepository(Protocol):
    def agregar(self, evento: EventoSeguimiento) -> EventoSeguimiento: ...

    def listar_por_reclamo(self, reclamo_id: int) -> list[EventoSeguimiento]: ...


@dataclass(slots=True)
class Repositorios:
    """Conjunto de repositorios que reciben los servicios en cada solicitud."""

    usuarios: UsuarioRepository
    reclamos: ReclamoRepository
    eventos: EventoRepository
