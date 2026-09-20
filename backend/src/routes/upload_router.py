"""Upload routes — food photos, admin-only, rate-limited."""

from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy.orm import Session

from src.database import get_db
from src.middleware.auth import require_roles
from src.models.response import ok
from src.repositories.schema import AccountRole
from src.services import upload_service
from src.utils.rate_limit import limiter

router = APIRouter(prefix="/upload", tags=["uploads"])


@router.post("/image")
@limiter.limit("5/minute")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    item_name: str = Form("food"),
    _admin=Depends(require_roles(AccountRole.ADMIN)),
    db: Session = Depends(get_db),
) -> dict:
    image_url = upload_service.process_and_store(file, item_name)
    return ok({"image_url": image_url})
