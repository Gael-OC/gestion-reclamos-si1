from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# El motor abre conexiones solo cuando se utilizan; no crea tablas al importar.
engine = create_engine(settings.database_url.get_secret_value(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """Sesión por solicitud: confirma al terminar sin errores y revierte si falla.

    Pensada para `app.api.deps.get_repositorios` cuando existan los repositorios
    SQL. Todavía no la usa ningún endpoint.
    """
    with SessionLocal() as sesion:
        try:
            yield sesion
            sesion.commit()
        except Exception:
            sesion.rollback()
            raise
