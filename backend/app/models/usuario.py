from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_perfil: Mapped[int] = mapped_column(ForeignKey("perfil.id_perfil"))
    nombre: Mapped[str] = mapped_column(String(120))
    correo: Mapped[str] = mapped_column(String(160), unique=True)
    contrasena_hash: Mapped[str] = mapped_column(String(255))
