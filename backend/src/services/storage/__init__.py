"""Storage drivers (local + s3)."""

from src.services.storage.storage import delete_image, save_image

__all__ = ["delete_image", "save_image"]
