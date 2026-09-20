def test_admin_list_and_create_employee(client, admin_user):
    _, _, headers = admin_user
    listing = client.get("/api/v1/admin/employees", headers=headers)
    assert listing.status_code == 200
    emails = [e["account_email"] for e in listing.json()["data"]]
    assert "admin@test.com" in emails

    created = client.post(
        "/api/v1/admin/employees",
        json={"name": "New Staff", "email": "newstaff@test.com"},
        headers=headers,
    )
    assert created.status_code == 200
    data = created.json()["data"]
    assert data["account_email"] == "newstaff@test.com"
    assert data["account_role"] == "employee"
    assert data["has_password"] is False
    assert data["can_delete"] is True

    duplicate = client.post(
        "/api/v1/admin/employees",
        json={"name": "Dup", "email": "newstaff@test.com"},
        headers=headers,
    )
    assert duplicate.status_code == 409


def test_email_already_active_conflict(client, admin_user, employee_user):
    _, _, admin_headers = admin_user
    _, _, _ = employee_user
    duplicate = client.post(
        "/api/v1/admin/employees",
        json={"name": "Dup", "email": "staff@test.com"},
        headers=admin_headers,
    )
    assert duplicate.status_code == 409

    second_signup = client.post(
        "/api/v1/auth/signup",
        json={"email": "staff@test.com", "password": "staff12345", "confirm": "staff12345"},
    )
    assert second_signup.status_code == 409


def test_admin_order_history_and_csv(client, admin_user):
    _, _, headers = admin_user
    history = client.get("/api/v1/admin/orders", headers=headers)
    assert history.status_code == 200
    assert history.json()["data"] == []

    export = client.get("/api/v1/admin/orders/export", headers=headers)
    assert export.status_code == 200
    assert export.headers["content-type"].startswith("text/csv")
    assert "Order Number" in export.text


def test_employee_cannot_access_admin(client, employee_user):
    _, _, headers = employee_user
    resp = client.get("/api/v1/admin/employees", headers=headers)
    assert resp.status_code == 403


def test_admin_cannot_delete_self_type(client, admin_user):
    _, _, headers = admin_user
    admins = [
        e
        for e in client.get("/api/v1/admin/employees", headers=headers).json()["data"]
        if e["account_role"] == "admin"
    ]
    resp = client.delete(f"/api/v1/admin/employees/{admins[0]['account_uuid']}", headers=headers)
    assert resp.status_code == 409


def test_admin_update_employee(client, admin_user):
    _, _, headers = admin_user
    created = client.post(
        "/api/v1/admin/employees",
        json={"name": "Edit Me", "email": "edit@test.com"},
        headers=headers,
    ).json()["data"]

    updated = client.patch(
        f"/api/v1/admin/employees/{created['account_uuid']}",
        json={"name": "Renamed Staff"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["account_name"] == "Renamed Staff"
    assert updated.json()["data"]["account_email"] == "edit@test.com"

    conflicting = client.patch(
        f"/api/v1/admin/employees/{created['account_uuid']}",
        json={"email": "admin@test.com"},
        headers=headers,
    )
    assert conflicting.status_code == 409