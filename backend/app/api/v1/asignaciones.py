from fastapi import APIRouter

from app.api.deps import AsignacionesDep, Gestor, PresentadorDep
from app.schemas.comunes import ErrorRespuesta
from app.schemas.reclamos import AsignacionSolicitud, ReclamoDetalle
from app.schemas.usuarios import CargaFuncionario, UsuarioResumen

router = APIRouter(tags=["asignaciones"])


@router.post(
    "/reclamos/{reclamo_id}/asignacion",
    response_model=ReclamoDetalle,
    responses={
        404: {"model": ErrorRespuesta, "description": "Reclamo no encontrado"},
        409: {"model": ErrorRespuesta, "description": "No válido en el estado actual"},
    },
)
def asignar_funcionario(
    reclamo_id: int,
    datos: AsignacionSolicitud,
    actor: Gestor,
    servicio: AsignacionesDep,
    presentador: PresentadorDep,
) -> ReclamoDetalle:
    """Asigna o reasigna un funcionario. Un reclamo `ingresado` pasa a `asignado`."""
    reclamo = servicio.asignar(reclamo_id, datos.funcionario_id, datos.motivo, actor)
    return presentador.detalle(reclamo)


@router.get("/asignaciones/carga", response_model=list[CargaFuncionario])
def carga_por_funcionario(actor: Gestor, servicio: AsignacionesDep) -> list[CargaFuncionario]:
    """Reclamos activos por funcionario, para elegir a quién asignar."""
    return [
        CargaFuncionario(funcionario=UsuarioResumen.model_validate(f), reclamos_activos=n)
        for f, n in servicio.carga(actor)
    ]
