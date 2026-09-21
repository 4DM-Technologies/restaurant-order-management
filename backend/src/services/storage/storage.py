"""Image storage driver abstraction — one switch via DEV_STORAGE_DRIVER.

save_image(data, slug)  -> public URL (absolute S3/CDN) or relative /images/... path.
delete_image(image_url) -> best-effort remove of an app-managed S3 upload.
"""

from src.services.storage import local_storage, s3_storage
from src.settings import settings


def save_image(data: bytes, slug: str) -> str:
    driver = settings.storage_driver.lower()
    if driver == "s3":
        return s3_storage.save_image(data, slug)
    return local_storage.save_image(data, slug)


def delete_image(image_url: str | None) -> bool:
    if not image_url or settings.storage_driver.lower() != "s3":
        return False
    return s3_storage.delete_image(image_url)
