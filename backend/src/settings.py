"""Application settings — all values come from DEV_-prefixed env vars (.env)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the Soroco House backend (dev/sandbox only)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DEV_",
        extra="ignore",
        case_sensitive=False,
    )

    # ── App ──────────────────────────────────────────────────────────────────
    app_name: str = "restaurant-order-management"
    host: str = "0.0.0.0"
    port: int = 8000
    # Public base URL shown in the startup banner (e.g. https://api.example.com).
    public_url: str = ""

    # ── Database ─────────────────────────────────────────────────────────────
    database_url: str = "sqlite:///./data/restaurant.db"

    # ── Auth (JWT HS256) ─────────────────────────────────────────────────────
    jwt_secret_key: str = "change-me-strong-secret"
    jwt_expire_minutes: int = 480
    auth_rate_limit: str = "5/minute"

    # ── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── Payments ──────────────────────────────────────────────────────────────
    # mock (default until real gateways are integrated) | phonepay | razorpay
    payment_provider: str = "mock"
    phonepay_merchant_id: str = "MERCHANTUAT"
    phonepay_base_url: str = "https://api-preprod.phonepe.com/apis/pg-sandbox"
    phonepay_salt_key: str = ""
    phonepay_salt_index: int = 1
    razorpay_key_id: str = "rzp_test_xxxx"
    razorpay_key_secret: str = ""

    # ── Bill email ───────────────────────────────────────────────────────────
    email_mock: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_sender: str = ""

    # ── Image storage (Section 9A / 12) ──────────────────────────────────────
    storage_driver: str = "local"
    upload_dir: str = "./uploads"
    upload_max_size_mb: int = 5
    upload_allowed_types: str = "jpeg,png,webp"
    # External hosts (comma-separated) allowed as menu image_url values.
    image_url_hosts: str = "images.unsplash.com"

    @property
    def image_url_host_list(self) -> list[str]:
        return [h.strip() for h in self.image_url_hosts.split(",") if h.strip()]

    # S3 driver (used only when storage_driver == "s3").
    # Credentials may be supplied explicitly via DEV_S3_ACCESS_KEY_ID /
    # DEV_S3_SECRET_ACCESS_KEY; when empty, boto3 falls back to the AWS default
    # credential chain (EC2 IAM role locally / ~/.aws/credentials).
    s3_bucket: str = "soroco-food-images"
    s3_region: str = "ap-south-1"
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_cdn_url: str = ""

    # ── Uploaded image serving ───────────────────────────────────────────────
    @property
    def upload_max_bytes(self) -> int:
        return self.upload_max_size_mb * 1024 * 1024

    @property
    def upload_allowed_type_list(self) -> list[str]:
        return [t.strip() for t in self.upload_allowed_types.split(",") if t.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
