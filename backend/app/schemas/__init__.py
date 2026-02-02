# backend/app/schemas/__init__.py
from app.schemas.material import (
    MaterialCreate,
    MaterialUpdate,
    MaterialResponse,
    MaterialListResponse,
    MaterialImportResult,
)

__all__ = [
    "MaterialCreate",
    "MaterialUpdate",
    "MaterialResponse",
    "MaterialListResponse",
    "MaterialImportResult",
]
