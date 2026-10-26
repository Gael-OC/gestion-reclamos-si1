from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.v1.router import router as api_v1_router
from app.core.config import Settings, settings
from app.core.errores import ErrorDominio, NoAutenticado
from app.core.reloj import Reloj
from app.repositories.datos_demo import cargar_datos_demo
from app.repositories.memoria import AlmacenMemoria


def create_app(config: Settings = settings, reloj: Reloj | None = None) -> FastAPI:
    """Crea la aplicación. Las pruebas pueden pasar otra configuración o un reloj fijo."""
    app = FastAPI(
        title=config.app_name,
        description="Prototipo académico ficticio UCN 2026, sin relación institucional con SERNAC.",
        version="0.1.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.settings = config
    app.state.reloj = reloj or Reloj(config.zona_horaria)
    if config.almacenamiento == "memoria":
        app.state.almacen = AlmacenMemoria()
        if config.cargar_datos_demo:
            cargar_datos_demo(app.state.almacen, app.state.reloj, config)
    else:
        raise NotImplementedError(
            "ALMACENAMIENTO=sql aún no está disponible: faltan los repositorios con PostgreSQL. "
            "Usa ALMACENAMIENTO=memoria."
        )

    @app.exception_handler(ErrorDominio)
    def manejar_error_dominio(_: Request, error: ErrorDominio) -> JSONResponse:
        encabezados = {"WWW-Authenticate": "Bearer"} if isinstance(error, NoAutenticado) else None
        return JSONResponse(
            status_code=error.estado_http,
            content={"detail": error.mensaje, "codigo": error.codigo},
            headers=encabezados,
        )

    app.include_router(health_router)
    app.include_router(api_v1_router, prefix="/api/v1")
    return app


app = create_app()
