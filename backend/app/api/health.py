from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["infraestructura"])
def health() -> dict[str, str]:
    """Comprueba el proceso HTTP; no consulta PostgreSQL."""
    return {"status": "ok"}
