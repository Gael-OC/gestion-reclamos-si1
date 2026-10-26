"""Control de plazos: reglas puras, sin acceso a datos, fáciles de probar.

Propuesta del prototipo (pendiente de confirmar): plazo de `plazo_dias` días
corridos desde la fecha local de ingreso; un reclamo activo está "por vencer"
cuando le quedan entre 0 y `dias_alerta` días (incluido hoy) y "vencido" cuando
la fecha límite ya pasó. Los anulados no se evalúan.
"""

from dataclasses import dataclass
from datetime import date, timedelta

from app.domain.entidades import Reclamo
from app.domain.enums import EstadoReclamo, SituacionPlazo


def calcular_fecha_limite(fecha_ingreso_local: date, plazo_dias: int) -> date:
    return fecha_ingreso_local + timedelta(days=plazo_dias)


@dataclass(frozen=True, slots=True)
class EvaluacionPlazo:
    fecha_limite: date
    dias_transcurridos: int
    dias_restantes: int | None
    situacion: SituacionPlazo


def evaluar_plazo(
    reclamo: Reclamo,
    hoy: date,
    fecha_ingreso_local: date,
    fecha_cierre_local: date | None,
    dias_alerta: int,
) -> EvaluacionPlazo:
    limite = reclamo.fecha_limite

    if reclamo.estado in (EstadoReclamo.CERRADO, EstadoReclamo.ANULADO):
        fin = fecha_cierre_local or hoy
        transcurridos = (fin - fecha_ingreso_local).days
        if reclamo.estado == EstadoReclamo.ANULADO:
            situacion = SituacionPlazo.NO_APLICA
        elif fin <= limite:
            situacion = SituacionPlazo.CERRADO_EN_PLAZO
        else:
            situacion = SituacionPlazo.CERRADO_FUERA_DE_PLAZO
        return EvaluacionPlazo(limite, transcurridos, None, situacion)

    restantes = (limite - hoy).days
    if restantes < 0:
        situacion = SituacionPlazo.VENCIDO
    elif restantes <= dias_alerta:
        situacion = SituacionPlazo.POR_VENCER
    else:
        situacion = SituacionPlazo.EN_PLAZO
    return EvaluacionPlazo(limite, (hoy - fecha_ingreso_local).days, restantes, situacion)


def rango_fecha_limite(
    situacion: SituacionPlazo, hoy: date, dias_alerta: int
) -> tuple[date | None, date | None]:
    """Rango de `fecha_limite` equivalente a una situación, para filtrar reclamos activos.

    Permite que el repositorio SQL filtre por columnas sin conocer la regla.
    """
    if situacion == SituacionPlazo.VENCIDO:
        return None, hoy - timedelta(days=1)
    if situacion == SituacionPlazo.POR_VENCER:
        return hoy, hoy + timedelta(days=dias_alerta)
    if situacion == SituacionPlazo.EN_PLAZO:
        return hoy + timedelta(days=dias_alerta + 1), None
    raise ValueError(f"La situación {situacion} no se filtra por rango de fechas.")
