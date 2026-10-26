import unittest

from utilidades import FUNCIONARIO_1, FUNCIONARIO_2, SUPERVISOR, PruebaAPI


class ReclamosTest(PruebaAPI):
    def test_crear_reclamo(self) -> None:
        reclamo = self.crear_reclamo(self.token(FUNCIONARIO_1))
        self.assertEqual(reclamo["estado"], "ingresado")
        self.assertRegex(reclamo["folio"], r"^R-2026-\d{6}$")
        self.assertEqual(reclamo["consumidor_rut"], "11111111-1")
        self.assertEqual(reclamo["consumidor_correo"], "persona@correo.test")
        self.assertEqual(reclamo["plazo"]["fecha_limite"], "2026-11-15")
        self.assertEqual(reclamo["plazo"]["dias_restantes"], 20)
        self.assertEqual(reclamo["registrado_por"]["rol"], "funcionario")

        seguimiento = self.client.get(
            f"/api/v1/reclamos/{reclamo['id']}/seguimiento", headers=self.token(SUPERVISOR)
        ).json()
        self.assertEqual([e["tipo"] for e in seguimiento], ["creacion"])

    def test_validaciones_de_entrada(self) -> None:
        encabezados = self.token(SUPERVISOR)
        for cambio in (
            {"consumidor_rut": "12.345.678-9"},
            {"descripcion": "corta"},
            {"canal": "fax"},
        ):
            with self.subTest(cambio=cambio):
                respuesta = self.client.post(
                    "/api/v1/reclamos",
                    json={**self._datos(), **cambio},
                    headers=encabezados,
                )
                self.assertEqual(respuesta.status_code, 422)

    def test_listado_paginado_y_filtros(self) -> None:
        encabezados = self.token(SUPERVISOR)
        pagina = self.client.get("/api/v1/reclamos?por_pagina=5&pagina=2", headers=encabezados)
        cuerpo = pagina.json()
        self.assertEqual((cuerpo["total"], cuerpo["paginas"], len(cuerpo["items"])), (13, 3, 5))

        estados = self.client.get(
            "/api/v1/reclamos?estado=cerrado&estado=anulado", headers=encabezados
        ).json()
        self.assertEqual({r["estado"] for r in estados["items"]}, {"cerrado", "anulado"})

        vencidos = self.client.get(
            "/api/v1/reclamos?situacion_plazo=vencido", headers=encabezados
        ).json()["items"]
        self.assertTrue(vencidos)
        self.assertEqual({r["plazo"]["situacion"] for r in vencidos}, {"vencido"})

        sin_asignar = self.client.get("/api/v1/reclamos?sin_asignar=true", headers=encabezados)
        self.assertTrue(all(r["funcionario"] is None for r in sin_asignar.json()["items"]))

        busqueda = self.client.get("/api/v1/reclamos?q=telefon", headers=encabezados).json()
        self.assertEqual(busqueda["total"], 3)

    def test_funcionario_solo_ve_sus_reclamos(self) -> None:
        encabezados = self.token(FUNCIONARIO_1)
        propio_id = self.usuario_id(FUNCIONARIO_1)
        items = self.client.get("/api/v1/reclamos", headers=encabezados).json()["items"]
        self.assertTrue(items)
        self.assertTrue(all(r["funcionario"]["id"] == propio_id for r in items))

        ajeno = self.client.get(
            "/api/v1/reclamos?q=Fernanda", headers=self.token(SUPERVISOR)
        ).json()["items"][0]
        respuesta = self.client.get(f"/api/v1/reclamos/{ajeno['id']}", headers=encabezados)
        self.assertEqual(respuesta.status_code, 404)

    def test_flujo_completo_hasta_el_cierre(self) -> None:
        supervisor = self.token(SUPERVISOR)
        funcionario = self.token(FUNCIONARIO_1)
        reclamo = self.crear_reclamo(supervisor)
        url = f"/api/v1/reclamos/{reclamo['id']}"

        # Sin funcionario no puede pasar a gestión.
        self.assertEqual(self._estado(url, supervisor, "en_gestion").status_code, 409)

        asignacion = self.client.post(
            f"{url}/asignacion",
            json={"funcionario_id": self.usuario_id(FUNCIONARIO_1)},
            headers=supervisor,
        )
        self.assertEqual(asignacion.json()["estado"], "asignado")

        self.assertEqual(self._estado(url, funcionario, "en_gestion").status_code, 200)
        gestion = self.client.post(
            f"{url}/gestiones", json={"descripcion": "Se llamó a la empresa."}, headers=funcionario
        )
        self.assertEqual(gestion.status_code, 201)
        self.assertEqual(self._estado(url, funcionario, "esperando_empresa").status_code, 200)

        # Cerrar exige comentario; el funcionario no puede anular.
        self.assertEqual(self._estado(url, funcionario, "cerrado").status_code, 422)
        self.assertEqual(self._estado(url, funcionario, "anulado", "x").status_code, 403)
        cierre = self._estado(url, funcionario, "cerrado", "Empresa devolvió el dinero.")
        self.assertEqual(cierre.status_code, 200)
        cuerpo = cierre.json()
        self.assertEqual(cuerpo["resultado"], "Empresa devolvió el dinero.")
        self.assertEqual(cuerpo["plazo"]["situacion"], "cerrado_en_plazo")

        # Cerrado es final.
        self.assertEqual(self._estado(url, supervisor, "en_gestion").status_code, 409)
        tipos = [
            e["tipo"] for e in self.client.get(f"{url}/seguimiento", headers=supervisor).json()
        ]
        self.assertEqual(
            tipos,
            [
                "creacion",
                "asignacion",
                "cambio_estado",
                "gestion",
                "cambio_estado",
                "cambio_estado",
            ],
        )

    def test_transicion_invalida(self) -> None:
        supervisor = self.token(SUPERVISOR)
        reclamo = self.crear_reclamo(supervisor)
        respuesta = self._estado(f"/api/v1/reclamos/{reclamo['id']}", supervisor, "cerrado", "x")
        self.assertEqual(respuesta.status_code, 409)
        self.assertEqual(respuesta.json()["codigo"], "transicion_invalida")

    def test_actualizar_datos_queda_en_seguimiento(self) -> None:
        supervisor = self.token(SUPERVISOR)
        reclamo = self.crear_reclamo(supervisor)
        url = f"/api/v1/reclamos/{reclamo['id']}"
        respuesta = self.client.patch(url, json={"categoria": "Transporte"}, headers=supervisor)
        self.assertEqual(respuesta.json()["categoria"], "Transporte")
        eventos = self.client.get(f"{url}/seguimiento", headers=supervisor).json()
        self.assertEqual(eventos[-1]["tipo"], "actualizacion")

    def test_funcionario_no_gestiona_reclamo_ajeno_que_registro(self) -> None:
        func_1 = self.token(FUNCIONARIO_1)
        reclamo = self.crear_reclamo(func_1)
        self.client.post(
            f"/api/v1/reclamos/{reclamo['id']}/asignacion",
            json={"funcionario_id": self.usuario_id(FUNCIONARIO_2)},
            headers=self.token(SUPERVISOR),
        )
        # Lo registró, así que lo ve, pero solo el asignado lo gestiona.
        url = f"/api/v1/reclamos/{reclamo['id']}"
        self.assertEqual(self.client.get(url, headers=func_1).status_code, 200)
        respuesta = self.client.post(f"{url}/gestiones", json={"descripcion": "x"}, headers=func_1)
        self.assertEqual(respuesta.status_code, 403)

    def _estado(
        self, url: str, encabezados: dict[str, str], estado: str, comentario: str | None = None
    ):
        return self.client.post(
            f"{url}/estado", json={"estado": estado, "comentario": comentario}, headers=encabezados
        )

    @staticmethod
    def _datos() -> dict:
        from utilidades import DATOS_RECLAMO

        return dict(DATOS_RECLAMO)


if __name__ == "__main__":
    unittest.main()
