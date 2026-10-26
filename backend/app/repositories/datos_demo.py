"""Datos ficticios para desarrollar e integrar sin PostgreSQL.

Personas, empresas y casos son inventados; no representan información de SERNAC.
Las fechas se calculan desde el día actual para que siempre existan reclamos en
plazo, por vencer, vencidos y cerrados.
"""

from datetime import timedelta
from functools import lru_cache

from app.core.config import Settings
from app.core.reloj import Reloj
from app.core.seguridad import hashear_contrasena
from app.domain.entidades import EventoSeguimiento, Reclamo, Usuario
from app.domain.enums import CanalIngreso, EstadoReclamo, Rol, TipoEvento
from app.repositories.memoria import AlmacenMemoria
from app.services.plazos import calcular_fecha_limite

CONTRASENA_DEMO = "demo1234"

USUARIOS_DEMO = [
    ("Administración Demo", "admin@reclamos.test", Rol.ADMINISTRADOR),
    ("Sofía Supervisora", "supervisor@reclamos.test", Rol.SUPERVISOR),
    ("Andrés Funcionario", "funcionario1@reclamos.test", Rol.FUNCIONARIO),
    ("Beatriz Funcionaria", "funcionario2@reclamos.test", Rol.FUNCIONARIO),
    ("Carlos Funcionario", "funcionario3@reclamos.test", Rol.FUNCIONARIO),
]

# Empresas y categorías inventadas.
TEL = ("Telefonía Ejemplo SpA", "Telecomunicaciones")
RET = ("Retail Demo Ltda.", "Comercio")
BAN = ("Banco Prueba S.A.", "Servicios financieros")
AER = ("Aerolínea Ficticia S.A.", "Transporte")
INM = ("Inmobiliaria Modelo SpA", "Vivienda")
E = EstadoReclamo

# (días desde el ingreso, estado, índice del funcionario o None, consumidor, empresa)
RECLAMOS_DEMO = [
    (1, E.INGRESADO, None, "Valentina Rojas", TEL),
    (2, E.INGRESADO, None, "Matías Pérez", RET),
    (4, E.PENDIENTE_ANTECEDENTES, None, "Camila Torres", BAN),
    (5, E.ASIGNADO, 0, "Diego Muñoz", AER),
    (9, E.EN_GESTION, 1, "Fernanda Silva", INM),
    (12, E.ESPERANDO_EMPRESA, 0, "Joaquín Herrera", TEL),
    (17, E.EN_GESTION, 2, "Isidora Vargas", RET),
    (18, E.ESPERANDO_EMPRESA, 1, "Tomás Castillo", BAN),
    (20, E.EN_GESTION, 0, "Antonia Reyes", AER),
    (24, E.ESPERANDO_EMPRESA, 2, "Benjamín Soto", TEL),
    (27, E.CERRADO, 1, "Martina Fuentes", RET),
    (35, E.CERRADO, 0, "Lucas Morales", INM),
    (8, E.ANULADO, None, "Emilia Contreras", BAN),
]

CANALES = [CanalIngreso.WEB, CanalIngreso.PRESENCIAL, CanalIngreso.TELEFONO, CanalIngreso.CORREO]


@lru_cache(maxsize=1)
def _hash_demo() -> str:
    return hashear_contrasena(CONTRASENA_DEMO)


def _rut(cuerpo: int) -> str:
    """RUT ficticio con dígito verificador válido."""
    digitos = str(cuerpo)
    suma = sum(int(d) * f for d, f in zip(reversed(digitos), [2, 3, 4, 5, 6, 7] * 2, strict=False))
    dv = {11: "0", 10: "K"}.get(11 - suma % 11, str(11 - suma % 11))
    return f"{digitos}-{dv}"


def cargar_datos_demo(almacen: AlmacenMemoria, reloj: Reloj, settings: Settings) -> None:
    repos = almacen.repositorios()
    usuarios = [
        repos.usuarios.crear(
            Usuario(id=0, nombre=nombre, correo=correo, rol=rol, hash_contrasena=_hash_demo())
        )
        for nombre, correo, rol in USUARIOS_DEMO
    ]
    supervisor = usuarios[1]
    funcionarios = [u for u in usuarios if u.rol == Rol.FUNCIONARIO]
    ahora = reloj.ahora()

    for n, (dias, estado, idx_func, consumidor, (empresa, categoria)) in enumerate(RECLAMOS_DEMO):
        ingreso = ahora - timedelta(days=dias, hours=n % 5)
        ingreso_local = reloj.fecha_local(ingreso)
        funcionario = funcionarios[idx_func] if idx_func is not None else None
        terminado = estado in (EstadoReclamo.CERRADO, EstadoReclamo.ANULADO)
        # Un cerrado queda fuera de plazo (25 días) y el otro dentro (18 días).
        dias_cierre = min(dias - 2, 18 if n % 2 else 25)
        cierre = ingreso + timedelta(days=dias_cierre if estado == EstadoReclamo.CERRADO else 1)
        reclamo = repos.reclamos.crear(
            Reclamo(
                id=0,
                folio="",
                consumidor_nombre=consumidor,
                consumidor_rut=_rut(15_000_000 + n * 731_219),
                consumidor_correo=f"consumidor{n + 1}@correo.test",
                empresa_nombre=empresa,
                categoria=categoria,
                descripcion=(
                    f"Caso ficticio de {categoria.lower()}: el consumidor reporta un "
                    "problema con el producto o servicio contratado y solicita una solución."
                ),
                canal=CANALES[n % len(CANALES)],
                estado=estado,
                registrado_por_id=supervisor.id,
                funcionario_id=funcionario.id if funcionario else None,
                fecha_ingreso=ingreso,
                fecha_limite=calcular_fecha_limite(ingreso_local, settings.plazo_dias),
                fecha_cierre=cierre if terminado else None,
                resultado=(
                    "Empresa acoge la solicitud del consumidor (caso ficticio)."
                    if estado == EstadoReclamo.CERRADO
                    else "Reclamo duplicado (caso ficticio)."
                    if estado == EstadoReclamo.ANULADO
                    else None
                ),
                actualizado_en=cierre if terminado else ingreso + timedelta(days=1),
            )
        )
        reclamo.folio = f"R-{ingreso_local.year}-{reclamo.id:06d}"
        repos.reclamos.guardar(reclamo)

        def evento(tipo: TipoEvento, desfase: timedelta, detalle: str, **extra: object) -> None:
            repos.eventos.agregar(
                EventoSeguimiento(
                    id=0,
                    reclamo_id=reclamo.id,
                    tipo=tipo,
                    fecha=ingreso + desfase,
                    usuario_id=supervisor.id,
                    detalle=detalle,
                    **extra,  # type: ignore[arg-type]
                )
            )

        evento(TipoEvento.CREACION, timedelta(0), "Reclamo registrado.")
        if funcionario:
            evento(
                TipoEvento.ASIGNACION,
                timedelta(hours=2),
                "Asignación inicial.",
                estado_anterior=EstadoReclamo.INGRESADO,
                estado_nuevo=EstadoReclamo.ASIGNADO,
                funcionario_nuevo_id=funcionario.id,
            )
        if estado not in (EstadoReclamo.INGRESADO, EstadoReclamo.ASIGNADO):
            anterior = EstadoReclamo.ASIGNADO if funcionario else EstadoReclamo.INGRESADO
            evento(
                TipoEvento.CAMBIO_ESTADO,
                cierre - ingreso if terminado else timedelta(days=1),
                reclamo.resultado or "Cambio de estado (caso ficticio).",
                estado_anterior=anterior,
                estado_nuevo=estado,
            )
