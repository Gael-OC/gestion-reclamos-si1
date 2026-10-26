from math import ceil
from typing import Annotated, Literal

from fastapi import APIRouter, Query, status

from app.api.deps import PresentadorDep, ReclamosDep, UsuarioActual
from app.domain.enums import EstadoReclamo, SituacionPlazo
from app.repositories.base import OrdenReclamos
from app.schemas.comunes import ErrorRespuesta, Pagina
from app.schemas.reclamos import (
    CambioEstadoSolicitud,
    EventoLeer,
    GestionSolicitud,
    ReclamoActualizar,
    ReclamoCrear,
    ReclamoDetalle,
    ReclamoResumen,
)
from app.services.reclamos import CriteriosListado

router = APIRouter(
    prefix="/reclamos",
    tags=["reclamos"],
    responses={404: {"model": ErrorRespuesta, "description": "Reclamo no encontrado"}},
)

_CONFLICTO = {409: {"model": ErrorRespuesta, "description": "No válido en el estado actual"}}


@router.get("", response_model=Pagina[ReclamoResumen])
def listar_reclamos(
    usuario: UsuarioActual,
    servicio: ReclamosDep,
    presentador: PresentadorDep,
    estado: Annotated[list[EstadoReclamo] | None, Query()] = None,
    funcionario_id: int | None = None,
    sin_asignar: bool = False,
    situacion_plazo: Literal["en_plazo", "por_vencer", "vencido"] | None = None,
    q: Annotated[
        str | None, Query(description="Busca en folio, consumidor, empresa y categoría")
    ] = None,
    orden: OrdenReclamos = "fecha_ingreso_desc",
    pagina: Annotated[int, Query(ge=1)] = 1,
    por_pagina: Annotated[int, Query(ge=1, le=100)] = 20,
) -> Pagina[ReclamoResumen]:
    """Lista los reclamos visibles para el usuario. `estado` se puede repetir."""
    criterios = CriteriosListado(
        estados=estado or (),
        funcionario_id=funcionario_id,
        sin_asignar=sin_asignar,
        situacion_plazo=SituacionPlazo(situacion_plazo) if situacion_plazo else None,
        texto=q,
        orden=orden,
        pagina=pagina,
        por_pagina=por_pagina,
    )
    items, total = servicio.listar(criterios, usuario)
    return Pagina[ReclamoResumen](
        items=[presentador.resumen(r) for r in items],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        paginas=ceil(total / por_pagina) if total else 0,
    )


@router.post("", response_model=ReclamoDetalle, status_code=status.HTTP_201_CREATED)
def crear_reclamo(
    datos: ReclamoCrear, usuario: UsuarioActual, servicio: ReclamosDep, presentador: PresentadorDep
) -> ReclamoDetalle:
    """Registra un reclamo en estado `ingresado` y calcula su fecha límite."""
    return presentador.detalle(servicio.crear(datos, usuario))


@router.get("/{reclamo_id}", response_model=ReclamoDetalle)
def obtener_reclamo(
    reclamo_id: int, usuario: UsuarioActual, servicio: ReclamosDep, presentador: PresentadorDep
) -> ReclamoDetalle:
    return presentador.detalle(servicio.obtener(reclamo_id, usuario))


@router.patch("/{reclamo_id}", response_model=ReclamoDetalle, responses=_CONFLICTO)
def actualizar_reclamo(
    reclamo_id: int,
    datos: ReclamoActualizar,
    usuario: UsuarioActual,
    servicio: ReclamosDep,
    presentador: PresentadorDep,
) -> ReclamoDetalle:
    """Corrige datos de un reclamo activo. Queda registrado en el seguimiento."""
    return presentador.detalle(servicio.actualizar(reclamo_id, datos, usuario))


@router.post("/{reclamo_id}/estado", response_model=ReclamoDetalle, responses=_CONFLICTO)
def cambiar_estado(
    reclamo_id: int,
    datos: CambioEstadoSolicitud,
    usuario: UsuarioActual,
    servicio: ReclamosDep,
    presentador: PresentadorDep,
) -> ReclamoDetalle:
    """Cambia el estado según el flujo permitido. Ver `docs/api.md`."""
    reclamo = servicio.cambiar_estado(reclamo_id, datos.estado, datos.comentario, usuario)
    return presentador.detalle(reclamo)


@router.get("/{reclamo_id}/seguimiento", response_model=list[EventoLeer])
def ver_seguimiento(
    reclamo_id: int, usuario: UsuarioActual, servicio: ReclamosDep, presentador: PresentadorDep
) -> list[EventoLeer]:
    """Historial del reclamo en orden cronológico: creación, asignaciones, estados y gestiones."""
    return [presentador.evento(e) for e in servicio.seguimiento(reclamo_id, usuario)]


@router.post(
    "/{reclamo_id}/gestiones",
    response_model=EventoLeer,
    status_code=status.HTTP_201_CREATED,
    responses=_CONFLICTO,
)
def registrar_gestion(
    reclamo_id: int,
    datos: GestionSolicitud,
    usuario: UsuarioActual,
    servicio: ReclamosDep,
    presentador: PresentadorDep,
) -> EventoLeer:
    """Registra una gestión (llamada, correo, oficio, nota) sin cambiar el estado."""
    return presentador.evento(servicio.registrar_gestion(reclamo_id, datos.descripcion, usuario))
