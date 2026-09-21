def _create_menu_item(client, admin_headers, **overrides):
    payload = {
        "category": "Hot Luxury Teas",
        "name": "Darjeeling First Flush",
        "description": "Delicate golden liquor.",
        "standard_price": 280,
        "image_url": "https://images.unsplash.com/tea.jpg",
        **overrides,
    }
    return client.post("/api/v1/menu", json=payload, headers=admin_headers)


def test_menu_starts_empty(client):
    assert client.get("/api/v1/menu").json() == {"success": True, "data": []}


def test_menu_create_requires_admin(client):
    resp = _create_menu_item(client, {})
    assert resp.status_code == 401


def test_menu_crud_flow(client, admin_user):
    _, _, headers = admin_user
    created = _create_menu_item(client, headers)
    assert created.status_code == 200
    item = created.json()["data"]
    assert item["item_name"] == "Darjeeling First Flush"
    assert item["standard_price"] == 280.0
    menu_uuid = item["menu_uuid"]

    listing = client.get("/api/v1/menu").json()["data"]
    assert listing[0]["category"] == "Hot Luxury Teas"
    assert listing[0]["items"][0]["menu_uuid"] == menu_uuid

    patched = client.patch(
        f"/api/v1/menu/{menu_uuid}",
        json={"large_price": 340},
        headers=headers,
    )
    assert patched.status_code == 200
    assert patched.json()["data"]["large_price"] == 340.0

    deleted = client.delete(f"/api/v1/menu/{menu_uuid}", headers=headers)
    assert deleted.status_code == 200
    assert client.get("/api/v1/menu").json()["data"] == []


def test_menu_missing_item_patch_404(client, admin_user):
    _, _, headers = admin_user
    resp = client.patch(
        "/api/v1/menu/00000000-0000-0000-0000-000000000000",
        json={"name": "x"},
        headers=headers,
    )
    assert resp.status_code == 404


def test_menu_image_url_must_be_trusted(client, admin_user):
    _, _, headers = admin_user
    untrusted = _create_menu_item(
        client, headers, image_url="https://evil.example.com/x.jpg"
    )
    assert untrusted.status_code == 422
    relative = _create_menu_item(client, headers, image_url="/images/food.webp")
    assert relative.status_code == 200


OLD_KEY = "cake-1234abcd.webp"
NEW_KEY = "tea-5678efgh.webp"
OLD_URL = f"/api/v1/images/{OLD_KEY}"
NEW_URL = f"/api/v1/images/{NEW_KEY}"


class _FakeS3Client:
    def __init__(self):
        self.deleted: list[str] = []

    def delete_object(self, Bucket, Key):
        self.deleted.append(Key)


def _s3_spy(monkeypatch):
    """Simulate S3 driver and record delete_object keys."""
    from src.settings import settings

    fake = _FakeS3Client()
    monkeypatch.setattr(settings, "storage_driver", "s3")
    monkeypatch.setattr("src.services.storage.s3_storage._client", lambda: fake)
    return fake.deleted


def test_patch_replacing_uploaded_image_deletes_old(client, admin_user, monkeypatch):
    _, _, headers = admin_user
    deleted = _s3_spy(monkeypatch)
    created = _create_menu_item(client, headers, name="Cake", image_url=OLD_URL)
    menu_uuid = created.json()["data"]["menu_uuid"]
    resp = client.patch(
        f"/api/v1/menu/{menu_uuid}", json={"image_url": NEW_URL}, headers=headers
    )
    assert resp.status_code == 200
    assert deleted == [OLD_KEY]


def test_patch_without_image_change_does_not_delete(client, admin_user, monkeypatch):
    _, _, headers = admin_user
    deleted = _s3_spy(monkeypatch)
    created = _create_menu_item(client, headers, name="Cake", image_url=OLD_URL)
    menu_uuid = created.json()["data"]["menu_uuid"]
    resp = client.patch(
        f"/api/v1/menu/{menu_uuid}", json={"large_price": 300}, headers=headers
    )
    assert resp.status_code == 200
    assert deleted == []


def test_delete_item_deletes_uploaded_image(client, admin_user, monkeypatch):
    _, _, headers = admin_user
    deleted = _s3_spy(monkeypatch)
    created = _create_menu_item(client, headers, name="Cake", image_url=OLD_URL)
    menu_uuid = created.json()["data"]["menu_uuid"]
    resp = client.delete(f"/api/v1/menu/{menu_uuid}", headers=headers)
    assert resp.status_code == 200
    assert deleted == [OLD_KEY]


def test_shared_uploaded_image_is_kept(client, admin_user, monkeypatch):
    _, _, headers = admin_user
    deleted = _s3_spy(monkeypatch)
    first = _create_menu_item(client, headers, name="Cake A", image_url=OLD_URL)
    second = _create_menu_item(client, headers, name="Cake B", image_url=OLD_URL)
    assert first.status_code == 200
    assert second.status_code == 200
    menu_uuid = first.json()["data"]["menu_uuid"]
    resp = client.patch(
        f"/api/v1/menu/{menu_uuid}", json={"image_url": NEW_URL}, headers=headers
    )
    assert resp.status_code == 200
    assert deleted == []


def test_external_image_is_never_deleted(client, admin_user, monkeypatch):
    _, _, headers = admin_user
    deleted = _s3_spy(monkeypatch)
    created = _create_menu_item(client, headers, name="Cake")
    menu_uuid = created.json()["data"]["menu_uuid"]
    resp = client.delete(f"/api/v1/menu/{menu_uuid}", headers=headers)
    assert resp.status_code == 200
    assert deleted == []