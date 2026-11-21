from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


@lru_cache(maxsize=1)
def _fabrica_sesiones() -> sessionmaker[Session]:
    engine = create_engine(settings.url_postgresql(), pool_pre_ping=True)
    return sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """Sesión por solicitud: confirma al terminar sin errores y revierte si falla.

    Pensada para `app.api.deps.get_repositorios` cuando existan los repositorios
    SQL. Todavía no la usa ningún endpoint.
    """
    crear_sesion = _fabrica_sesiones()
    with crear_sesion() as sesion:
        try:
            yield sesion
            sesion.commit()
        except Exception:
            sesion.rollback()
            raise
