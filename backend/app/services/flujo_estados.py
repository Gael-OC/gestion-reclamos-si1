"""Flujo de estados de un reclamo (propuesta pendiente de confirmar por el equipo).

`asignado` no se alcanza con un cambio de estado: lo produce la asignación de un
funcionario a un reclamo `ingresado` (ver `services/asignaciones.py`).
"""

from app.core.errores import ReglaNegocio, TransicionInvalida
from app.domain.entidades import Reclamo
from app.domain.enums import EstadoReclamo as E

TRANSICIONES: dict[E, frozenset[E]] = {
    E.INGRESADO: frozenset({E.PENDIENTE_ANTECEDENTES, E.ANULADO}),
    E.PENDIENTE_ANTECEDENTES: frozenset({E.INGRESADO, E.EN_GESTION, E.ANULADO}),
    E.ASIGNADO: frozenset({E.EN_GESTION, E.PENDIENTE_ANTECEDENTES, E.ANULADO}),
    E.EN_GESTION: frozenset({E.ESPERANDO_EMPRESA, E.PENDIENTE_ANTECEDENTES, E.CERRADO, E.ANULADO}),
    E.ESPERANDO_EMPRESA: frozenset({E.EN_GESTION, E.CERRADO, E.ANULADO}),
    E.CERRADO: frozenset(),
    E.ANULADO: frozenset(),
}

# Estados que exigen un funcionario asignado.
REQUIEREN_FUNCIONARIO = frozenset({E.EN_GESTION, E.ESPERANDO_EMPRESA, E.CERRADO})
# Estados que exigen un comentario que explique el cambio.
REQUIEREN_COMENTARIO = frozenset({E.CERRADO, E.ANULADO, E.PENDIENTE_ANTECEDENTES})


def validar_transicion(reclamo: Reclamo, nuevo: E, comentario: str | None) -> None:
    actual = reclamo.estado
    if nuevo == actual:
        raise TransicionInvalida(f"El reclamo ya está en estado '{actual}'.")
    if nuevo not in TRANSICIONES[actual]:
        permitidos = ", ".join(sorted(TRANSICIONES[actual])) or "ninguno"
        raise TransicionInvalida(
            f"No se puede pasar de '{actual}' a '{nuevo}'. Estados permitidos: {permitidos}."
        )
    if nuevo in REQUIEREN_FUNCIONARIO and reclamo.funcionario_id is None:
        raise ReglaNegocio(f"Para pasar a '{nuevo}' el reclamo debe tener un funcionario asignado.")
    if nuevo == E.INGRESADO and reclamo.funcionario_id is not None:
        raise TransicionInvalida(
            "El reclamo ya tiene funcionario asignado; debe continuar a 'en_gestion'."
        )
    if nuevo in REQUIEREN_COMENTARIO and not (comentario and comentario.strip()):
        raise ReglaNegocio(f"Para pasar a '{nuevo}' se debe indicar un comentario.")
