def test_rename_column(seeded_client):
    resp = seeded_client.patch("/api/columns/1", json={"title": "Ideas"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Ideas"


def test_rename_column_not_found(seeded_client):
    resp = seeded_client.patch("/api/columns/999", json={"title": "x"})
    assert resp.status_code == 404
