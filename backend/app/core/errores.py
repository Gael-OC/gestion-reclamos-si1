"""Errores del dominio. `app.main` los traduce a respuestas HTTP con un formato común."""


class ErrorDominio(Exception):
    estado_http = 400
    codigo = "error"

    def __init__(self, mensaje: str) -> None:
        super().__init__(mensaje)
        self.mensaje = mensaje


class NoAutenticado(ErrorDominio):
    estado_http = 401
    codigo = "no_autenticado"


class PermisoDenegado(ErrorDominio):
    estado_http = 403
    codigo = "permiso_denegado"


class NoEncontrado(ErrorDominio):
    estado_http = 404
    codigo = "no_encontrado"


class Conflicto(ErrorDominio):
    """La operación no es válida para el estado actual del recurso."""

    estado_http = 409
    codigo = "conflicto"


class TransicionInvalida(Conflicto):
    codigo = "transicion_invalida"


class ReglaNegocio(ErrorDominio):
    """Los datos son válidos en forma, pero incumplen una regla de negocio."""

    estado_http = 422
    codigo = "regla_negocio"
