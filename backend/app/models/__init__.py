"""Modelos SQLAlchemy. Importarlos aquí registra su metadata en `Base`."""

from app.models.antecedente import Antecedente
from app.models.clasificacion import Clasificacion
from app.models.comuna import Comuna
from app.models.empresa import Empresa
from app.models.estado import Estado
from app.models.gestion import Gestion
from app.models.perfil import Perfil
from app.models.reclamo import Reclamo
from app.models.usuario import Usuario

__all__ = [
    "Antecedente",
    "Clasificacion",
    "Comuna",
    "Empresa",
    "Estado",
    "Gestion",
    "Perfil",
    "Reclamo",
    "Usuario",
]
