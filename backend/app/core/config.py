from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Gestión de reclamos — Prototipo académico"
    database_url: SecretStr = SecretStr(
        "postgresql+psycopg://reclamos:solo_desarrollo@127.0.0.1:5432/reclamos"
    )
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Origen de los datos. "memoria" funciona sin PostgreSQL y se reinicia con el
    # servidor; "sql" queda reservado para los repositorios con PostgreSQL.
    almacenamiento: Literal["memoria", "sql"] = "memoria"
    # Carga usuarios y reclamos ficticios al iniciar con almacenamiento en memoria.
    cargar_datos_demo: bool = True

    # Autenticación. La clave por defecto es ficticia y solo sirve en desarrollo local.
    jwt_secret: SecretStr = SecretStr("solo-desarrollo-cambiar-esta-clave-jwt-2026")
    jwt_algoritmo: Literal["HS256"] = "HS256"
    jwt_minutos_expiracion: int = Field(default=480, gt=0)

    # Reglas de plazo del prototipo (propuesta): días corridos desde el ingreso.
    plazo_dias: int = Field(default=20, gt=0)
    dias_alerta: int = Field(default=3, ge=0)
    zona_horaria: str = "America/Santiago"


settings = Settings()
