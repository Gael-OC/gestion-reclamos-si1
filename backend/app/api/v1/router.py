from fastapi import APIRouter

from app.api.v1 import asignaciones, auth, plazos, reclamos, usuarios
from app.schemas.comunes import RESPUESTAS_ERROR

router = APIRouter()
# Routers de negocio. Los contratos son una propuesta; ver docs/api.md.
router.include_router(auth.router)
router.include_router(usuarios.router, responses=RESPUESTAS_ERROR)
router.include_router(reclamos.router, responses=RESPUESTAS_ERROR)
router.include_router(asignaciones.router, responses=RESPUESTAS_ERROR)
router.include_router(plazos.router, responses=RESPUESTAS_ERROR)
