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