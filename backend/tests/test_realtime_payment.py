import uuid

import pytest
from sqlalchemy import select
from starlette.websockets import WebSocketDisconnect

from src.models.response import ok
from src.repositories.schema import OrderItem


def _seed_item(client, admin_headers, name=None):
    resp = client.post(
        "/api/v1/menu",
        json={
            "category": "Frappe",
            "name": name or "Classic Coffee Frappe",
            "description": "Blended espresso.",
            "standard_price": 280,
            "large_price": 340,
        },
        headers=admin_headers,
    )
    assert resp.status_code == 200
    return resp.json()["data"]["menu_uuid"]


def _payment_payload(menu_uuids, order_ref):
    return ok(
        {
            "order_ref": order_ref,
            "gateway_status": "success",
            "payment_method": "phonepay",
            "transaction_id": f"txn-{order_ref}",
            "table_name": "Table 2",
            "customer_name": "Berwin",
            "phone_number": "+91 90000 00000",
            "customer_email": "customer@example.com",
            "items": [
                {"menu_uuid": menu_uuids[0], "quantity": 2, "selected_size": "large"},
                {"menu_uuid": menu_uuids[1], "quantity": 1, "selected_size": None},
            ],
        }
    )["data"]


def test_payment_multi_item_rows_get_distinct_ids(client, admin_user, db):
    _, _, headers = admin_user
    m1 = _seed_item(client, headers, "Classic Coffee Frappe A")
    m2 = _seed_item(client, headers, "Classic Coffee Frappe B")
    order_ref = str(uuid.uuid4())

    resp = client.post("/api/v1/payments", json=_payment_payload([m1, m2], order_ref))
    assert resp.status_code == 200

    order_uuid = uuid.UUID(resp.json()["data"]["order"]["order_uuid"])
    rows = list(
        db.scalars(
            select(OrderItem).where(OrderItem.order_uuid == order_uuid)
        ).all()
    )
    assert len(rows) == 2
    ids = [r.order_item_id for r in rows]
    assert len(ids) == len(set(ids)), "each order item must get a unique id"


def test_menu_websocket_is_public(client):
    with client.websocket_connect("/api/v1/ws/menu") as ws:
        assert ws is not None


def test_orders_websocket_requires_token(client):
    with pytest.raises(WebSocketDisconnect) as exc, client.websocket_connect(
        "/api/v1/ws/orders"
    ):
        pass
    assert exc.value.code in (4401, 1008)