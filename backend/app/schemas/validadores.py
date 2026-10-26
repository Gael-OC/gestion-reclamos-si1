"""Validadores reutilizables de entrada."""

import re
from typing import Annotated

from pydantic import AfterValidator, StringConstraints

_PATRON_CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalizar_rut(valor: str) -> str:
    """Valida un RUT chileno con su dígito verificador y lo devuelve como `12345678-5`."""
    limpio = re.sub(r"[.\s-]", "", valor).upper()
    if not re.fullmatch(r"\d{7,8}[0-9K]", limpio):
        raise ValueError("RUT con formato inválido.")
    cuerpo, dv = limpio[:-1], limpio[-1]
    suma = sum(int(d) * f for d, f in zip(reversed(cuerpo), [2, 3, 4, 5, 6, 7] * 2, strict=False))
    esperado = {11: "0", 10: "K"}.get(11 - suma % 11, str(11 - suma % 11))
    if dv != esperado:
        raise ValueError("RUT con dígito verificador inválido.")
    return f"{cuerpo}-{dv}"


def normalizar_correo(valor: str) -> str:
    valor = valor.strip().lower()
    if not _PATRON_CORREO.fullmatch(valor):
        raise ValueError("Correo electrónico inválido.")
    return valor


Rut = Annotated[str, AfterValidator(normalizar_rut)]
Correo = Annotated[str, StringConstraints(max_length=254), AfterValidator(normalizar_correo)]
Texto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
