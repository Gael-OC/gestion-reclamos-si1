from pathlib import Path

from pydantic import SecretStr
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


settings = Settings()
