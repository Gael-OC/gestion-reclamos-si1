from pydantic import BaseModel, Field


class Pagina[T](BaseModel):
    items: list[T]
    total: int = Field(description="Total de resultados que cumplen los filtros.")
    pagina: int
    por_pagina: int
    paginas: int


class ErrorRespuesta(BaseModel):
    """Formato de error común (propuesta). Los errores de validación 422 de FastAPI
    mantienen su formato por defecto: `detail` es una lista con los campos inválidos."""

    detail: str
    codigo: str = Field(examples=["transicion_invalida"])


RESPUESTAS_ERROR: dict[int | str, dict] = {
    401: {"model": ErrorRespuesta, "description": "No autenticado"},
    403: {"model": ErrorRespuesta, "description": "Sin permiso"},
}
