from src.settings import get_settings


def test_settings_load_defaults() -> None:
    settings = get_settings()
    assert settings.app_name == "restaurant-order-management"
    assert "http://localhost:5173" in settings.cors_origin_list
    assert settings.jwt_expire_minutes == 480
    assert settings.payment_provider == "mock"
    assert settings.storage_driver == "local"
    assert settings.upload_max_bytes > 0
    assert settings.upload_allowed_type_list == ["jpeg", "png", "webp"]


def test_rate_limit_string() -> None:
    assert get_settings().auth_rate_limit == "5/minute"