from fastapi import APIRouter

from app.api.deps import PlazosDep, PresentadorDep, UsuarioActual
from app.schemas.reclamos import ReclamoResumen, ResumenPlazos

router = APIRouter(prefix="/plazos", tags=["control de plazos"])


@router.get("/alertas", response_model=list[ReclamoResumen])
def alertas(
    usuario: UsuarioActual, servicio: PlazosDep, presentador: PresentadorDep
) -> list[ReclamoResumen]:
    """Reclamos activos vencidos o por vencer, del más urgente al menos urgente."""
    return [presentador.resumen(r) for r in servicio.alertas(usuario)]


@router.get("/resumen", response_model=ResumenPlazos)
def resumen(usuario: UsuarioActual, servicio: PlazosDep) -> ResumenPlazos:
    """Conteos de activos, sin asignar, en plazo, por vencer y vencidos a la fecha de corte."""
    return ResumenPlazos(**servicio.resumen(usuario))
