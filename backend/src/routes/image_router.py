"""Image serving — streams S3 objects through the API for private buckets.

Uploaded photos end up in a private S3 bucket (Block Public Access = on), so
`/images/{filename}` fetches the object server-side and returns the bytes.
Local driver uploads keep using the `/images` static mount instead.
"""

import os

from fastapi import APIRouter
from fastapi.responses import Response

from src.settings import settings
from src.utils.exceptions import NotFoundError
from src.utils.logger import logger

router = APIRouter(prefix="/images", tags=["images"])

_MEDIA_TYPE = "image/webp"


@router.get("/{filename}")
def serve_image(filename: str) -> Response:
    if settings.storage_driver.lower() != "s3":
        # Local driver uploads are served by the static `/images` mount instead.
        raise NotFoundError("Image not found")

    import boto3

    client = boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION", "ap-south-1"),
    )
    try:
        obj = client.get_object(Bucket=settings.s3_bucket, Key=filename)
    except client.exceptions.NoSuchKey:
        logger.warning("Image not found in S3: %s", filename)
        raise NotFoundError("Image not found") from None

    return Response(
        content=obj["Body"].read(),
        media_type=obj.get("ContentType") or _MEDIA_TYPE,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
        },
    )
