import uuid

from src.models.response import ok


def _seed_item(client, admin_headers):
    resp = client.post(
        "/api/v1/menu",
        json={
            "category": "Frappe",
            "name": "Classic Coffee Frappe",
            "description": "Blended espresso.",
            "standard_price": 280,
            "large_price": 340,
        },
        headers=admin_headers,
    )
    return resp.json()["data"]["menu_uuid"]


def _payment_payload(menu_uuids, order_ref, status="success"):
    return ok(
        {
            "order_ref": order_ref,
            "gateway_status": status,
            "payment_method": "phonepay",
            "transaction_id": f"txn-{order_ref}",
            "table_name": "Table 2",
            "customer_name": "Berwin",
            "phone_number": "+91 90000 00000",
            "customer_email": "customer@example.com",
"items": [
            {
                "menu_uuid": menu_uuids[0],
                "quantity": 2,
                "selected_size": "large",
            }
        ],
        }
    )["data"]


def test_payment_success_creates_order(client, admin_user):
    _, _, headers = admin_user
    menu_uuid = _seed_item(client, headers)
    order_ref = str(uuid.uuid4())

    resp = client.post("/api/v1/payments", json=_payment_payload([menu_uuid], order_ref))
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["payment_status"] == "success"
    assert data["total"] == 714.0  # (2 x large 340) + 5% GST 34
    assert data["order"]["subtotal"] == 680.0
    assert data["order"]["tax"] == 34.0
    assert data["order"]["items"][0]["selected_size"] == "large"

    kitchen = client.get("/api/v1/orders/kitchen", headers=headers)
    assert kitchen.status_code == 200
    assert len(kitchen.json()["data"]) == 1
    assert kitchen.json()["data"][0]["order_uuid"] == data["order"]["order_uuid"]


def test_payment_idempotent_on_order_ref(client, admin_user):
    _, _, headers = admin_user
    menu_uuid = _seed_item(client, headers)
    order_ref = str(uuid.uuid4())

    first = client.post("/api/v1/payments", json=_payment_payload([menu_uuid], order_ref))
    second = client.post("/api/v1/payments", json=_payment_payload([menu_uuid], order_ref))
    assert first.status_code == 200
    assert second.status_code == 200
    assert (
        first.json()["data"]["order_number"] == second.json()["data"]["order_number"]
    )

    kitchen = client.get("/api/v1/orders/kitchen", headers=headers)
    assert len(kitchen.json()["data"]) == 1


def test_payment_failed_creates_no_order(client, admin_user):
    _, _, headers = admin_user
    menu_uuid = _seed_item(client, headers)
    order_ref = str(uuid.uuid4())

    resp = client.post(
        "/api/v1/payments",
        json=_payment_payload([menu_uuid], order_ref, status="failed"),
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["payment_status"] == "failed"

    kitchen = client.get("/api/v1/orders/kitchen", headers=headers)
    assert kitchen.json()["data"] == []


def test_payment_unknown_item_rejected(client):
    resp = client.post(
        "/api/v1/payments",
        json=_payment_payload(
            ["00000000-0000-0000-0000-000000000000"], str(uuid.uuid4())
        ),
    )
    assert resp.status_code == 422