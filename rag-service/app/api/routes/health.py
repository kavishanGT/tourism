from fastapi import APIRouter

from app.core.config import settings
from app.models.health import HealthData, HealthResponse


router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "",
    response_model=HealthResponse,
)
async def health_check() -> HealthResponse:

    return HealthResponse(
        success=True,
        data=HealthData(
            status="UP",
            service=settings.app_name,
            version=settings.app_version,
        ),
    )