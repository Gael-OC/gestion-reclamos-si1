"""Repositorios en memoria para desarrollar e integrar sin PostgreSQL.

Los datos se pierden al reiniciar el servidor. Devuelven copias de las entidades
para que un cambio solo quede guardado al llamar a `guardar`, como ocurrirá con
la base de datos.
"""

from dataclasses import replace
from threading import RLock

from app.domain.entidades import EventoSeguimiento, Reclamo, Usuario
from app.domain.enums import ESTADOS_ACTIVOS, Rol
from app.repositories.base import FiltroReclamos, Repositorios


class AlmacenMemoria:
    def __init__(self) -> None:
        self.bloqueo = RLock()
        self.usuarios: dict[int, Usuario] = {}
        self.reclamos: dict[int, Reclamo] = {}
        self.eventos: dict[int, EventoSeguimiento] = {}
        self._secuencias = {"usuarios": 0, "reclamos": 0, "eventos": 0}

    def siguiente_id(self, tabla: str) -> int:
        self._secuencias[tabla] += 1
        return self._secuencias[tabla]

    def repositorios(self) -> Repositorios:
        return Repositorios(
            usuarios=UsuarioRepositoryMemoria(self),
            reclamos=ReclamoRepositoryMemoria(self),
            eventos=EventoRepositoryMemoria(self),
        )


class UsuarioRepositoryMemoria:
    def __init__(self, almacen: AlmacenMemoria) -> None:
        self._a = almacen

    def obtener(self, usuario_id: int) -> Usuario | None:
        with self._a.bloqueo:
            usuario = self._a.usuarios.get(usuario_id)
            return replace(usuario) if usuario else None

    def obtener_por_correo(self, correo: str) -> Usuario | None:
        correo = correo.strip().lower()
        with self._a.bloqueo:
            for usuario in self._a.usuarios.values():
                if usuario.correo.lower() == correo:
                    return replace(usuario)
        return None

    def listar(self, rol: Rol | None = None, activo: bool | None = None) -> list[Usuario]:
        with self._a.bloqueo:
            return [
                replace(u)
                for u in sorted(self._a.usuarios.values(), key=lambda u: u.nombre)
                if (rol is None or u.rol == rol) and (activo is None or u.activo == activo)
            ]

    def crear(self, usuario: Usuario) -> Usuario:
        with self._a.bloqueo:
            nuevo = replace(usuario, id=self._a.siguiente_id("usuarios"))
            self._a.usuarios[nuevo.id] = nuevo
            return replace(nuevo)

    def guardar(self, usuario: Usuario) -> Usuario:
        with self._a.bloqueo:
            self._a.usuarios[usuario.id] = replace(usuario)
            return replace(usuario)


class ReclamoRepositoryMemoria:
    def __init__(self, almacen: AlmacenMemoria) -> None:
        self._a = almacen

    def obtener(self, reclamo_id: int) -> Reclamo | None:
        with self._a.bloqueo:
            reclamo = self._a.reclamos.get(reclamo_id)
            return replace(reclamo) if reclamo else None

    def buscar(self, filtro: FiltroReclamos) -> tuple[list[Reclamo], int]:
        with self._a.bloqueo:
            candidatos = [r for r in self._a.reclamos.values() if _cumple(r, filtro)]

        clave, descendente = {
            "fecha_ingreso_desc": (lambda r: (r.fecha_ingreso, r.id), True),
            "fecha_ingreso_asc": (lambda r: (r.fecha_ingreso, r.id), False),
            "fecha_limite_asc": (lambda r: (r.fecha_limite, r.id), False),
            "fecha_limite_desc": (lambda r: (r.fecha_limite, r.id), True),
        }[filtro.orden]
        candidatos.sort(key=clave, reverse=descendente)

        fin = None if filtro.limite is None else filtro.desplazamiento + filtro.limite
        pagina = candidatos[filtro.desplazamiento : fin]
        return [replace(r) for r in pagina], len(candidatos)

    def crear(self, reclamo: Reclamo) -> Reclamo:
        with self._a.bloqueo:
            nuevo = replace(reclamo, id=self._a.siguiente_id("reclamos"))
            self._a.reclamos[nuevo.id] = nuevo
            return replace(nuevo)

    def guardar(self, reclamo: Reclamo) -> Reclamo:
        with self._a.bloqueo:
            self._a.reclamos[reclamo.id] = replace(reclamo)
            return replace(reclamo)

    def contar_activos_por_funcionario(self) -> dict[int, int]:
        conteo: dict[int, int] = {}
        with self._a.bloqueo:
            for r in self._a.reclamos.values():
                if r.funcionario_id is not None and r.estado in ESTADOS_ACTIVOS:
                    conteo[r.funcionario_id] = conteo.get(r.funcionario_id, 0) + 1
        return conteo


def _cumple(r: Reclamo, f: FiltroReclamos) -> bool:
    if f.estados and r.estado not in f.estados:
        return False
    if f.funcionario_id is not None and r.funcionario_id != f.funcionario_id:
        return False
    if f.sin_asignar and r.funcionario_id is not None:
        return False
    if f.visible_para_usuario_id is not None and f.visible_para_usuario_id not in (
        r.funcionario_id,
        r.registrado_por_id,
    ):
        return False
    if f.fecha_limite_desde is not None and r.fecha_limite < f.fecha_limite_desde:
        return False
    if f.fecha_limite_hasta is not None and r.fecha_limite > f.fecha_limite_hasta:
        return False
    if f.texto:
        texto = f.texto.strip().lower()
        campos = (r.folio, r.consumidor_nombre, r.empresa_nombre, r.categoria)
        if not any(texto in campo.lower() for campo in campos):
            return False
    return True


class EventoRepositoryMemoria:
    def __init__(self, almacen: AlmacenMemoria) -> None:
        self._a = almacen

    def agregar(self, evento: EventoSeguimiento) -> EventoSeguimiento:
        with self._a.bloqueo:
            nuevo = replace(evento, id=self._a.siguiente_id("eventos"))
            self._a.eventos[nuevo.id] = nuevo
            return replace(nuevo)

    def listar_por_reclamo(self, reclamo_id: int) -> list[EventoSeguimiento]:
        with self._a.bloqueo:
            eventos = [replace(e) for e in self._a.eventos.values() if e.reclamo_id == reclamo_id]
        return sorted(eventos, key=lambda e: (e.fecha, e.id))
