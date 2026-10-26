from enum import StrEnum


class Rol(StrEnum):
    """Roles de usuario (propuesta pendiente de confirmar por el equipo)."""

    ADMINISTRADOR = "administrador"
    SUPERVISOR = "supervisor"
    FUNCIONARIO = "funcionario"


class EstadoReclamo(StrEnum):
    """Estados del proceso; coinciden con `frontend/src/features/reclamos/estados.ts`."""

    INGRESADO = "ingresado"
    PENDIENTE_ANTECEDENTES = "pendiente_antecedentes"
    ASIGNADO = "asignado"
    EN_GESTION = "en_gestion"
    ESPERANDO_EMPRESA = "esperando_empresa"
    CERRADO = "cerrado"
    ANULADO = "anulado"

    @property
    def es_activo(self) -> bool:
        return self not in ESTADOS_FINALES


ESTADOS_FINALES = frozenset({EstadoReclamo.CERRADO, EstadoReclamo.ANULADO})
ESTADOS_ACTIVOS = frozenset(EstadoReclamo) - ESTADOS_FINALES


class CanalIngreso(StrEnum):
    WEB = "web"
    PRESENCIAL = "presencial"
    TELEFONO = "telefono"
    CORREO = "correo"


class TipoEvento(StrEnum):
    """Tipos de evento del historial de seguimiento de un reclamo."""

    CREACION = "creacion"
    ACTUALIZACION = "actualizacion"
    ASIGNACION = "asignacion"
    REASIGNACION = "reasignacion"
    CAMBIO_ESTADO = "cambio_estado"
    GESTION = "gestion"


class SituacionPlazo(StrEnum):
    """Situación del plazo de gestión, calculada a la fecha de corte."""

    EN_PLAZO = "en_plazo"
    POR_VENCER = "por_vencer"
    VENCIDO = "vencido"
    CERRADO_EN_PLAZO = "cerrado_en_plazo"
    CERRADO_FUERA_DE_PLAZO = "cerrado_fuera_de_plazo"
    NO_APLICA = "no_aplica"
