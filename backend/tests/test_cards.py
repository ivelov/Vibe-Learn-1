def test_create_card(seeded_client):
    resp = seeded_client.post("/api/cards", json={"column_id": "1", "title": "New", "details": "D"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["title"] == "New"
    assert body["details"] == "D"
    assert isinstance(body["id"], str)


def test_create_card_invalid_column(seeded_client):
    resp = seeded_client.post("/api/cards", json={"column_id": "999", "title": "x", "details": "y"})
    assert resp.status_code == 404


def test_update_card(seeded_client):
    resp = seeded_client.patch("/api/cards/1", json={"title": "Updated", "details": "D2"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "Updated"
    assert body["details"] == "D2"


def test_update_card_not_found(seeded_client):
    resp = seeded_client.patch("/api/cards/999", json={"title": "x", "details": "y"})
    assert resp.status_code == 404


def test_delete_card(seeded_client):
    resp = seeded_client.delete("/api/cards/1")
    assert resp.status_code == 204
    board = seeded_client.get("/api/board").json()
    backlog_ids = [c["id"] for c in board["columns"][0]["cards"]]
    assert "1" not in backlog_ids


def test_delete_card_not_found(seeded_client):
    resp = seeded_client.delete("/api/cards/999")
    assert resp.status_code == 404
