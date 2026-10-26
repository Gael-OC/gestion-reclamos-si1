import unittest

from utilidades import ADMIN, FUNCIONARIO_1, SUPERVISOR, PruebaAPI


class AuthTest(PruebaAPI):
    def test_login_entrega_token_y_usuario(self) -> None:
        respuesta = self.client.post(
            "/api/v1/auth/login",
            json={"correo": "SUPERVISOR@reclamos.test", "contrasena": "demo1234"},
        )
        self.assertEqual(respuesta.status_code, 200)
        cuerpo = respuesta.json()
        self.assertEqual(cuerpo["token_type"], "bearer")
        self.assertEqual(cuerpo["usuario"]["rol"], "supervisor")
        self.assertNotIn("hash_contrasena", cuerpo["usuario"])

    def test_credenciales_incorrectas(self) -> None:
        for correo, contrasena in ((SUPERVISOR, "incorrecta"), ("nadie@reclamos.test", "demo1234")):
            respuesta = self.client.post(
                "/api/v1/auth/login", json={"correo": correo, "contrasena": contrasena}
            )
            self.assertEqual(respuesta.status_code, 401)
            self.assertEqual(respuesta.json()["codigo"], "no_autenticado")

    def test_endpoints_protegidos(self) -> None:
        self.assertEqual(self.client.get("/api/v1/reclamos").status_code, 401)
        malo = {"Authorization": "Bearer no-es-un-token"}
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=malo).status_code, 401)

    def test_me(self) -> None:
        respuesta = self.client.get("/api/v1/auth/me", headers=self.token(FUNCIONARIO_1))
        self.assertEqual(respuesta.json()["correo"], FUNCIONARIO_1)

    def test_usuario_desactivado_pierde_acceso(self) -> None:
        encabezados_func = self.token(FUNCIONARIO_1)
        funcionario_id = self.usuario_id(FUNCIONARIO_1)
        respuesta = self.client.patch(
            f"/api/v1/usuarios/{funcionario_id}", json={"activo": False}, headers=self.token(ADMIN)
        )
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(
            self.client.get("/api/v1/auth/me", headers=encabezados_func).status_code, 401
        )


class UsuariosTest(PruebaAPI):
    NUEVO = {
        "nombre": "Nueva Funcionaria",
        "correo": "nueva@reclamos.test",
        "rol": "funcionario",
        "contrasena": "contrasena-segura",
    }

    def test_admin_crea_usuario_que_puede_iniciar_sesion(self) -> None:
        respuesta = self.client.post("/api/v1/usuarios", json=self.NUEVO, headers=self.token(ADMIN))
        self.assertEqual(respuesta.status_code, 201, respuesta.text)
        self.token("nueva@reclamos.test", "contrasena-segura")

    def test_correo_duplicado(self) -> None:
        datos = {**self.NUEVO, "correo": SUPERVISOR}
        respuesta = self.client.post("/api/v1/usuarios", json=datos, headers=self.token(ADMIN))
        self.assertEqual(respuesta.status_code, 409)

    def test_solo_admin_crea_usuarios(self) -> None:
        respuesta = self.client.post(
            "/api/v1/usuarios", json=self.NUEVO, headers=self.token(SUPERVISOR)
        )
        self.assertEqual(respuesta.status_code, 403)

    def test_supervisor_lista_funcionarios_asignables(self) -> None:
        respuesta = self.client.get(
            "/api/v1/usuarios?rol=funcionario&activo=true", headers=self.token(SUPERVISOR)
        )
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual({u["rol"] for u in respuesta.json()}, {"funcionario"})
        self.assertEqual(
            self.client.get("/api/v1/usuarios", headers=self.token(FUNCIONARIO_1)).status_code,
            403,
        )

    def test_admin_no_se_desactiva_a_si_mismo(self) -> None:
        admin_id = self.usuario_id(ADMIN)
        respuesta = self.client.patch(
            f"/api/v1/usuarios/{admin_id}", json={"activo": False}, headers=self.token(ADMIN)
        )
        self.assertEqual(respuesta.status_code, 422)


if __name__ == "__main__":
    unittest.main()
