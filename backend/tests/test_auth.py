"""Auth — account check + signup activation returns a token."""


def test_check_unknown_email(client):
    resp = client.get("/api/v1/auth/check?email=nobody@test.com")
    assert resp.status_code == 200
    assert resp.json()["data"] == {"exists": False, "has_password": False}


def test_signup_activates_and_returns_token(client, admin_user):
    _, _, admin_headers = admin_user
    created = client.post(
        "/api/v1/admin/employees",
        json={"name": "New Staff", "email": "newstaff@test.com"},
        headers=admin_headers,
    )
    assert created.status_code == 200

    check = client.get("/api/v1/auth/check?email=newstaff@test.com")
    assert check.json()["data"] == {"exists": True, "has_password": False}

    signup = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "New Staff",
            "email": "newstaff@test.com",
            "password": "newpass12345",
            "confirm": "newpass12345",
        },
    )
    assert signup.status_code == 200
    data = signup.json()["data"]
    assert "access_token" in data
    assert data["email"] == "newstaff@test.com"

    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "newstaff@test.com"

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "newstaff@test.com", "password": "newpass12345"},
    )
    assert login.status_code == 200