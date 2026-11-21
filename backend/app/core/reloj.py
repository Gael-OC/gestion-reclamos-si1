"""Fuente única de la fecha y hora actuales, reemplazable en las pruebas."""

from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo


class Reloj:
    def __init__(self, zona_horaria: str) -> None:
        self.zona = ZoneInfo(zona_horaria)

    def ahora(self) -> datetime:
        """Instante actual en UTC (así se guardan las fechas)."""
        return datetime.now(UTC)

    def hoy(self) -> date:
        """Fecha local de corte para calcular plazos (días corridos)."""
        return self.ahora().astimezone(self.zona).date()

    def fecha_local(self, instante: datetime) -> date:
        return instante.astimezone(self.zona).date()


class RelojFijo(Reloj):
    """Reloj detenido en un instante, para pruebas y datos de demostración."""

    def __init__(self, instante: datetime, zona_horaria: str = "America/Santiago") -> None:
        super().__init__(zona_horaria)
        self.instante = instante

    def ahora(self) -> datetime:
        return self.instante
