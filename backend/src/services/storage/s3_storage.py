"""S3 storage driver — boto3 put_object into a private bucket.

Private buckets (S3 Block Public Access on) are served back to the app via
`/api/v1/images/...` (see image_router), so stored URLs stay on the API origin.
If a public CDN (`DEV_S3_CDN_URL`) is configured, its URL is used instead.
"""

from src.settings import settings
from src.utils.logger import logger
from src.utils.slug import unique_filename


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
