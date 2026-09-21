"""S3 storage driver — boto3 put_object/delete_object into a private bucket.

Private buckets (S3 Block Public Access on) are served back to the app via
`/api/v1/images/...` (see image_router), so stored URLs stay on the API origin.
If a public CDN (`DEV_S3_CDN_URL`) is configured, its URL is used instead.
"""

import re

from src.settings import settings
from src.utils.logger import logger
from src.utils.slug import unique_filename

# Same pattern the image router enforces — only app-managed uploads are
# ever deleted (never external hosts like Unsplash).
_KEY_RE = re.compile(r"^[a-z0-9-]+\.webp$")


def _client():
    import boto3

    return boto3.client(
        "s3",
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id or None,
        aws_secret_access_key=settings.s3_secret_access_key or None,
    )


def save_image(data: bytes, slug: str) -> str:
    filename = unique_filename(slug, "webp")
    _client().put_object(
        Bucket=settings.s3_bucket,
        Key=filename,
        Body=data,
        ContentType="image/webp",
        CacheControl="public, max-age=31536000, immutable",
    )
    logger.info(
        "Image saved to S3: %s/%s (%d bytes)", settings.s3_bucket, filename, len(data)
    )
    if settings.s3_cdn_url:
        return f"{settings.s3_cdn_url.rstrip('/')}/{filename}"
    return f"/api/v1/images/{filename}"


def _key_from_url(image_url: str) -> str | None:
    """Extract the S3 key from an app-managed image URL, else None."""
    path = image_url
    if image_url.startswith("/api/v1/images/"):
        path = image_url[len("/api/v1/images/") :]
    elif settings.s3_cdn_url:
        cdn = settings.s3_cdn_url.rstrip("/")
        if image_url.startswith(f"{cdn}/"):
            path = image_url[len(f"{cdn}/") :]
        else:
            return None
    else:
        return None
    path = path.split("?", 1)[0]
    return path if _KEY_RE.match(path) else None


def delete_image(image_url: str) -> bool:
    """Best-effort delete of an app-managed S3 upload. External URLs are no-ops."""
    key = _key_from_url(image_url)
    if key is None:
        return False
    import botocore

    try:
        _client().delete_object(Bucket=settings.s3_bucket, Key=key)
    except (botocore.exceptions.BotoCoreError, botocore.exceptions.ClientError) as exc:
        logger.warning("Failed to delete image from S3: %s (%s)", key, exc)
        return False
    logger.info("Deleted image from S3: %s/%s", settings.s3_bucket, key)
    return True
