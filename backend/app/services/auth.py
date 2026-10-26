from app.core.errores import NoAutenticado
from app.core.seguridad import TokenEmitido, crear_token, leer_token, verificar_contrasena
from app.domain.entidades import Usuario
from app.services.base import Servicio


class ServicioAuth(Servicio):
    def iniciar_sesion(self, correo: str, contrasena: str) -> tuple[TokenEmitido, Usuario]:
        usuario = self.repos.usuarios.obtener_por_correo(correo)
        # Mismo mensaje para correo inexistente o contraseña incorrecta.
        if usuario is None or not verificar_contrasena(contrasena, usuario.hash_contrasena):
            raise NoAutenticado("Correo o contraseña incorrectos.")
        if not usuario.activo:
            raise NoAutenticado("La cuenta está desactivada.")
        return crear_token(usuario.id, usuario.rol, self.settings), usuario

    def usuario_desde_token(self, token: str) -> Usuario:
        usuario = self.repos.usuarios.obtener(leer_token(token, self.settings))
        if usuario is None or not usuario.activo:
            raise NoAutenticado("Token inválido o usuario desactivado.")
        return usuario
