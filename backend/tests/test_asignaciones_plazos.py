import unittest

from utilidades import ADMIN, FUNCIONARIO_1, FUNCIONARIO_2, SUPERVISOR, PruebaAPI


class AsignacionesTest(PruebaAPI):
    def test_reasignacion_conserva_estado_y_registra_evento(self) -> None:
        supervisor = self.token(SUPERVISOR)
        reclamo = self.crear_reclamo(supervisor)
        url = f"/api/v1/reclamos/{reclamo['id']}"
        f1, f2 = self.usuario_id(FUNCIONARIO_1), self.usuario_id(FUNCIONARIO_2)

        self.client.post(f"{url}/asignacion", json={"funcionario_id": f1}, headers=supervisor)
        respuesta = self.client.post(
            f"{url}/asignacion",
            json={"funcionario_id": f2, "motivo": "Redistribución de carga"},
            headers=supervisor,
        )
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()["estado"], "asignado")
        self.assertEqual(respuesta.json()["funcionario"]["id"], f2)

        ultimo = self.client.get(f"{url}/seguimiento", headers=supervisor).json()[-1]
        self.assertEqual(ultimo["tipo"], "reasignacion")
        self.assertEqual(ultimo["funcionario_anterior"]["id"], f1)
        self.assertEqual(ultimo["detalle"], "Redistribución de carga")

        repetida = self.client.post(
            f"{url}/asignacion", json={"funcionario_id": f2}, headers=supervisor
        )
        self.assertEqual(repetida.status_code, 409)

    def test_reglas_de_asignacion(self) -> None:
        supervisor = self.token(SUPERVISOR)
        reclamo = self.crear_reclamo(supervisor)
        url = f"/api/v1/reclamos/{reclamo['id']}/asignacion"

        # Solo a funcionarios activos.
        destino = {"funcionario_id": self.usuario_id(ADMIN)}
        self.assertEqual(self.client.post(url, json=destino, headers=supervisor).status_code, 422)
        # Un funcionario no asigna.
        destino = {"funcionario_id": self.usuario_id(FUNCIONARIO_2)}
        respuesta = self.client.post(url, json=destino, headers=self.token(FUNCIONARIO_1))
        self.assertEqual(respuesta.status_code, 403)

    def test_no_se_asignan_reclamos_cerrados(self) -> None:
        supervisor = self.token(SUPERVISOR)
        cerrado = self.client.get("/api/v1/reclamos?estado=cerrado", headers=supervisor).json()[
            "items"
        ][0]
        respuesta = self.client.post(
            f"/api/v1/reclamos/{cerrado['id']}/asignacion",
            json={"funcionario_id": self.usuario_id(FUNCIONARIO_2)},
            headers=supervisor,
        )
        self.assertEqual(respuesta.status_code, 409)

    def test_carga_por_funcionario(self) -> None:
        carga = self.client.get("/api/v1/asignaciones/carga", headers=self.token(SUPERVISOR)).json()
        self.assertEqual(len(carga), 3)
        self.assertEqual(sum(c["reclamos_activos"] for c in carga), 7)
        cantidades = [c["reclamos_activos"] for c in carga]
        self.assertEqual(cantidades, sorted(cantidades, reverse=True))


class PlazosAPITest(PruebaAPI):
    def test_resumen_cuadra_con_los_activos(self) -> None:
        resumen = self.client.get("/api/v1/plazos/resumen", headers=self.token(SUPERVISOR)).json()
        self.assertEqual(resumen["fecha_corte"], "2026-10-26")
        self.assertEqual(resumen["activos"], 10)
        self.assertEqual(
            resumen["en_plazo"] + resumen["por_vencer"] + resumen["vencidos"], resumen["activos"]
        )
        self.assertEqual(resumen["sin_asignar"], 3)

    def test_alertas_ordenadas_por_urgencia(self) -> None:
        alertas = self.client.get("/api/v1/plazos/alertas", headers=self.token(SUPERVISOR)).json()
        self.assertTrue(alertas)
        self.assertTrue(all(a["plazo"]["situacion"] in ("vencido", "por_vencer") for a in alertas))
        restantes = [a["plazo"]["dias_restantes"] for a in alertas]
        self.assertEqual(restantes, sorted(restantes))

    def test_alertas_del_funcionario_son_solo_suyas(self) -> None:
        propio_id = self.usuario_id(FUNCIONARIO_1)
        alertas = self.client.get("/api/v1/plazos/alertas", headers=self.token(FUNCIONARIO_1))
        self.assertTrue(all(a["funcionario"]["id"] == propio_id for a in alertas.json()))


if __name__ == "__main__":
    unittest.main()
