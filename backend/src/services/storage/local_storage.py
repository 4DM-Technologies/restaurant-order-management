"""Local (offline) storage driver — writes to DEV_UPLOAD_DIR, served at /images."""

import os

from src.settings import settings
from src.utils.logger import logger
from src.utils.slug import unique_filename


def save_image(data: bytes, slug: str) -> str:
    directory = settings.upload_dir
    os.makedirs(directory, exist_ok=True)
    filename = unique_filename(slug, "webp")
    with open(os.path.join(directory, filename), "wb") as handle:
        handle.write(data)
    logger.info("Image saved locally: /images/%s (%d bytes)", filename, len(data))
    return f"/images/{filename}"
