from pathlib import Path
from secrets import token_urlsafe
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )

    app_name: str = "Gestión de reclamos — Prototipo académico"
    database_url: SecretStr | None = Field(default=None, min_length=1)
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Origen de los datos. "memoria" funciona sin PostgreSQL y se reinicia con el
    # servidor; "sql" queda reservado para los repositorios con PostgreSQL.
    almacenamiento: Literal["memoria", "sql"] = "memoria"
    # Carga usuarios y reclamos ficticios al iniciar con almacenamiento en memoria.
    cargar_datos_demo: bool = False
    contrasena_demo: SecretStr | None = Field(default=None, min_length=16)

    # Sin configuración explícita, la clave solo dura lo que dura el proceso.
    jwt_secret: SecretStr = Field(
        default_factory=lambda: SecretStr(token_urlsafe(32)), min_length=32
    )
    jwt_algoritmo: Literal["HS256"] = "HS256"
    jwt_minutos_expiracion: int = Field(default=480, gt=0)

    # Reglas de plazo del prototipo (propuesta): días corridos desde el ingreso.
    plazo_dias: int = Field(default=20, gt=0)
    dias_alerta: int = Field(default=3, ge=0)
    zona_horaria: str = "America/Santiago"

    def url_postgresql(self) -> str:
        if self.database_url is None:
            raise ValueError("Configura DATABASE_URL para usar PostgreSQL.")
        return self.database_url.get_secret_value()


settings = Settings()
