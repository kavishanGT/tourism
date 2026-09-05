from pydantic import BaseModel


class HealthData(BaseModel):
    status: str
    service: str
    version: str


class HealthResponse(BaseModel):
    success: bool
    data: HealthData