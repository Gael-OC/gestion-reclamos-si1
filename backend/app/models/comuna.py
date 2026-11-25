from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Comuna(Base):
    __tablename__ = "comuna"

    id_comuna: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(60))
    region: Mapped[str] = mapped_column(String(60))
