import io

from PIL import Image


def _png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), color=(120, 40, 60)).save(buffer, format="PNG")
    return buffer.getvalue()


def test_upload_image(client, admin_user):
    _, _, headers = admin_user
    resp = client.post(
        "/api/v1/upload/image",
        headers=headers,
        data={"item_name": "Darjeeling First Flush"},
        files={"file": ("tea.png", _png_bytes(), "image/png")},
    )
    assert resp.status_code == 200
    image_url = resp.json()["data"]["image_url"]
    assert image_url.startswith("/images/")
    assert image_url.endswith(".webp")

    served = client.get(image_url)
    assert served.status_code == 200
    assert served.headers["content-type"].startswith("image/webp")


def test_upload_rejects_wrong_type(client, admin_user):
    _, _, headers = admin_user
    resp = client.post(
        "/api/v1/upload/image",
        headers=headers,
        data={"item_name": "bad"},
        files={"file": ("notes.txt", b"hello world", "text/plain")},
    )
    assert resp.status_code == 422
    assert resp.json()["code"] == "VALIDATION_ERROR"


def test_upload_requires_admin(client):
    resp = client.post(
        "/api/v1/upload/image",
        files={"file": ("tea.png", _png_bytes(), "image/png")},
    )
    assert resp.status_code == 401