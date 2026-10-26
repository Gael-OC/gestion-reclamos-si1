from app.core.errores import Conflicto, NoEncontrado, ReglaNegocio
from app.core.seguridad import hashear_contrasena
from app.domain.entidades import Usuario
from app.domain.enums import Rol
from app.schemas.usuarios import UsuarioActualizar, UsuarioCrear
from app.services.base import Servicio


class ServicioUsuarios(Servicio):
    def listar(self, rol: Rol | None = None, activo: bool | None = None) -> list[Usuario]:
        return self.repos.usuarios.listar(rol=rol, activo=activo)

    def crear(self, datos: UsuarioCrear) -> Usuario:
        if self.repos.usuarios.obtener_por_correo(datos.correo):
            raise Conflicto("Ya existe un usuario con ese correo.")
        return self.repos.usuarios.crear(
            Usuario(
                id=0,
                nombre=datos.nombre,
                correo=datos.correo,
                rol=datos.rol,
                hash_contrasena=hashear_contrasena(datos.contrasena),
            )
        )

    def actualizar(self, usuario_id: int, datos: UsuarioActualizar, actor: Usuario) -> Usuario:
        usuario = self.repos.usuarios.obtener(usuario_id)
        if usuario is None:
            raise NoEncontrado("Usuario no encontrado.")
        cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
        if usuario.id == actor.id and (
            cambios.get("activo") is False or cambios.get("rol", usuario.rol) != usuario.rol
        ):
            raise ReglaNegocio("No puedes desactivar tu propia cuenta ni cambiar tu rol.")
        if "contrasena" in cambios:
            usuario.hash_contrasena = hashear_contrasena(cambios.pop("contrasena"))
        for campo, valor in cambios.items():
            setattr(usuario, campo, valor)
        return self.repos.usuarios.guardar(usuario)
