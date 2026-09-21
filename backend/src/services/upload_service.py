"""Food photo upload: validate -> normalize to 640px WebP -> store via driver."""

from io import BytesIO

from fastapi import UploadFile
from PIL import Image, ImageOps

from src.services.storage import save_image
from src.settings import settings
from src.utils.exceptions import ValidationFailure
from src.utils.logger import logged, logger
from src.utils.slug import slugify

_MIME_BY_TYPE = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}

# Hard ceiling on decoded dimensions — guards against decompression bombs
# (tiny files that declare huge sizes and exhaust memory during decode).
_MAX_IMAGE_SIDE = 3000
_CHUNK = 1024 * 1024


def _allowed_mimes() -> set[str]:
    allowed: set[str] = set()
    for entry in settings.upload_allowed_types.split(","):
        mime = _MIME_BY_TYPE.get(entry.strip().lower())
        if mime:
            allowed.add(mime)
    return allowed


@logged(workflow="upload-image")
def process_and_store(file: UploadFile, item_name: str) -> str:
    if len(item_name) > 100:
        raise ValidationFailure("Item name is too long (max 100 characters)")

    mime = (file.content_type or "").lower()
    if mime not in _allowed_mimes():
        raise ValidationFailure("Only JPEG, PNG or WebP images are allowed")

    raw = bytearray()
    while True:
        chunk = file.file.read(_CHUNK)
        if not chunk:
            break
        raw.extend(chunk)
        if len(raw) > settings.upload_max_bytes:
            raise ValidationFailure(
                f"Image too large (max {settings.upload_max_size_mb} MB)"
            )

    try:
        image = Image.open(BytesIO(raw))
        image = ImageOps.exif_transpose(image)
    except Exception as exc:
        raise ValidationFailure("The file is not a decodable image") from exc

    if image.width > _MAX_IMAGE_SIDE or image.height > _MAX_IMAGE_SIDE:
        raise ValidationFailure("Image dimensions are too large")

    image = image.convert("RGB")

    if image.width > 640:
        height = round(image.height * 640 / image.width)
        image = image.resize((640, height), Image.Resampling.LANCZOS)

    output = BytesIO()
    image.save(output, format="WEBP", quality=82)
    image_url = save_image(output.getvalue(), slugify(item_name))
    logger.info("Uploaded food photo for '%s' → %s", item_name, image_url)
    return image_url
