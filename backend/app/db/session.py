from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# El motor abre conexiones solo cuando se utilizan; no crea tablas al importar.
engine = create_engine(settings.database_url.get_secret_value(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
