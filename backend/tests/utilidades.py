"""Apoyo común para las pruebas de la API: app aislada, reloj fijo y sesiones."""

import unittest
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.reloj import RelojFijo
from app.main import create_app
from app.repositories.datos_demo import CONTRASENA_DEMO

# 26 de octubre de 2026, 15:00 en Chile: misma fecha de corte que los mockups.
AHORA = datetime(2026, 10, 26, 15, 0, tzinfo=ZoneInfo("America/Santiago"))

ADMIN = "admin@reclamos.test"
SUPERVISOR = "supervisor@reclamos.test"
FUNCIONARIO_1 = "funcionario1@reclamos.test"
FUNCIONARIO_2 = "funcionario2@reclamos.test"

DATOS_RECLAMO = {
    "consumidor_nombre": "Persona Ficticia",
    "consumidor_rut": "11.111.111-1",
    "consumidor_correo": "Persona@Correo.test",
    "empresa_nombre": "Empresa Ficticia SpA",
    "categoria": "Comercio",
    "descripcion": "El producto llegó dañado y la empresa no responde.",
    "canal": "web",
}


class PruebaAPI(unittest.TestCase):
    """Cada prueba parte con una app nueva, datos demo y el reloj detenido en `AHORA`."""

    def setUp(self) -> None:
        self.reloj = RelojFijo(AHORA)
        config = Settings(_env_file=None, almacenamiento="memoria", cargar_datos_demo=True)
        self.app = create_app(config, reloj=self.reloj)
        self.client = TestClient(self.app)

    def token(self, correo: str, contrasena: str = CONTRASENA_DEMO) -> dict[str, str]:
        respuesta = self.client.post(
            "/api/v1/auth/login", json={"correo": correo, "contrasena": contrasena}
        )
        self.assertEqual(respuesta.status_code, 200, respuesta.text)
        return {"Authorization": f"Bearer {respuesta.json()['access_token']}"}

    def usuario_id(self, correo: str) -> int:
        return self.client.get("/api/v1/auth/me", headers=self.token(correo)).json()["id"]

    def crear_reclamo(self, encabezados: dict[str, str], **cambios: object) -> dict:
        respuesta = self.client.post(
            "/api/v1/reclamos", json={**DATOS_RECLAMO, **cambios}, headers=encabezados
        )
        self.assertEqual(respuesta.status_code, 201, respuesta.text)
        return respuesta.json()
