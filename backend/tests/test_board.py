def test_get_board_seeded(seeded_client):
    resp = seeded_client.get("/api/board")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["columns"]) == 5
    assert data["columns"][0]["title"] == "Backlog"
    assert len(data["columns"][0]["cards"]) == 2


def test_get_board_empty(client):
    resp = client.get("/api/board")
    assert resp.status_code == 200
    assert resp.json() == {"columns": []}
