from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Antecedente(Base):
    __tablename__ = "antecedente"

    id_antecedente: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_reclamo: Mapped[int] = mapped_column(ForeignKey("reclamo.id_reclamo"))
    id_autor: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"))
    fecha: Mapped[datetime] = mapped_column(DateTime)
    contenido: Mapped[str] = mapped_column(Text)
