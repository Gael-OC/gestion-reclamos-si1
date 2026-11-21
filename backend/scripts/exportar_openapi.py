"""Exporta el contrato OpenAPI a docs/api/openapi.json.

Uso, desde backend/ y con el entorno virtual activo:

    python -m scripts.exportar_openapi

El frontend puede generar tipos TypeScript desde ese archivo sin levantar el
backend. Volver a ejecutarlo después de cambiar endpoints o esquemas.
"""

import json
from pathlib import Path

from app.core.config import Settings
from app.main import create_app

DESTINO = Path(__file__).resolve().parents[2] / "docs" / "api" / "openapi.json"


def main() -> None:
    app = create_app(Settings(_env_file=None, cargar_datos_demo=False))
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    contenido = json.dumps(app.openapi(), ensure_ascii=False, indent=2) + "\n"
    DESTINO.write_text(contenido, encoding="utf-8", newline="\n")
    print(f"Contrato exportado en {DESTINO}")


if __name__ == "__main__":
    main()
