from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Gestion(Base):
    __tablename__ = "gestion"

    id_gestion: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_reclamo: Mapped[int] = mapped_column(ForeignKey("reclamo.id_reclamo"))
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id_usuario"))
    id_estado_anterior: Mapped[int | None] = mapped_column(ForeignKey("estado.id_estado"))
    id_estado_nuevo: Mapped[int | None] = mapped_column(ForeignKey("estado.id_estado"))
    fecha: Mapped[datetime] = mapped_column(DateTime)
    accion: Mapped[str] = mapped_column(String(60))
    detalle: Mapped[str] = mapped_column(Text)
    comunicable: Mapped[bool] = mapped_column(Boolean)
