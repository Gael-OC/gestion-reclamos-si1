from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Clasificacion(Base):
    __tablename__ = "clasificacion"

    id_clasificacion: Mapped[int] = mapped_column(Integer, primary_key=True)
    mercado: Mapped[str] = mapped_column(String(80))
    categoria: Mapped[str] = mapped_column(String(80))
    producto: Mapped[str] = mapped_column(String(100))
    motivo: Mapped[str] = mapped_column(String(120))
