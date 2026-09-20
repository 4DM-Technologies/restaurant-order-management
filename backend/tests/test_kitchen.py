import uuid


def _place_order(client, admin_headers):
    item = client.post(
        "/api/v1/menu",
        json={"category": "Cold Brew", "name": "Signature Cold Brew", "standard_price": 220},
        headers=admin_headers,
    ).json()["data"]
    resp = client.post(
        "/api/v1/payments",
        json={
            "order_ref": str(uuid.uuid4()),
            "gateway_status": "success",
            "payment_method": "phonepay",
            "transaction_id": "txn-1",
"table_name": "Table 4",
                "customer_name": "Test Customer",
                "phone_number": "+91 90000 00000",
                "customer_email": "customer@example.com",
                "items": [{"menu_uuid": item["menu_uuid"], "quantity": 1}],
        },
    )
    return resp.json()["data"]


def test_kitchen_board_and_status_update(client, admin_user, employee_user):
    _, _, admin_headers = admin_user
    _, _, _ = employee_user
    payment = _place_order(client, admin_headers)
    order_uuid = payment["order"]["order_uuid"]

    board = client.get(
        "/api/v1/orders/kitchen", headers={"Authorization": employee_user[2]["Authorization"]}
    )
    assert board.status_code == 200
    assert board.json()["data"][0]["kitchen_status"] == "in_queue"
    created_at = board.json()["data"][0]["created_at"]
    assert created_at.endswith("+00:00"), f"expected UTC offset, got: {created_at}"

    updated = client.patch(
        f"/api/v1/orders/{order_uuid}",
        json={"kitchen_status": "preparing"},
        headers=employee_user[2],
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["kitchen_status"] == "preparing"


def test_kitchen_requires_staff(client):
    assert client.get("/api/v1/orders/kitchen").status_code == 401