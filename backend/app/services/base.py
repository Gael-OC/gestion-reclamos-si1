from app.core.config import Settings
from app.core.reloj import Reloj
from app.repositories.base import Repositorios


class Servicio:
    """Base común: los servicios reciben repositorios, reloj y configuración."""

    def __init__(self, repos: Repositorios, reloj: Reloj, settings: Settings) -> None:
        self.repos = repos
        self.reloj = reloj
        self.settings = settings
