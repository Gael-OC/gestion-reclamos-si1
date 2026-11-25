from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Reclamo(Base):
    """Los registros históricos pueden no traer todos los datos (columnas con `?`)."""

    __tablename__ = "reclamo"

    id_reclamo: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_consumidor: Mapped[int | None] = mapped_column(ForeignKey("usuario.id_usuario"))
    id_responsable: Mapped[int | None] = mapped_column(ForeignKey("usuario.id_usuario"))
    id_estado: Mapped[int | None] = mapped_column(ForeignKey("estado.id_estado"))
    id_empresa: Mapped[int | None] = mapped_column(ForeignKey("empresa.id_empresa"))
    id_clasificacion: Mapped[int | None] = mapped_column(
        ForeignKey("clasificacion.id_clasificacion")
    )
    id_comuna: Mapped[int | None] = mapped_column(ForeignKey("comuna.id_comuna"))
    asunto: Mapped[str | None] = mapped_column(String(150))
    descripcion: Mapped[str | None] = mapped_column(Text)
    fecha_ingreso: Mapped[date | None] = mapped_column(Date)
    fecha_limite: Mapped[date | None] = mapped_column(Date)
    fecha_cierre: Mapped[date | None] = mapped_column(Date)
    resultado: Mapped[str | None] = mapped_column(String(60))
    origen: Mapped[str] = mapped_column(Enum("portal", "historico", name="origen_reclamo"))
