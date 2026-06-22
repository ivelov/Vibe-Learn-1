def test_move_card_within_column(seeded_client):
    resp = seeded_client.patch("/api/cards/1/move", json={"target_column_id": "1", "target_index": 1})
    assert resp.status_code == 200
    backlog_cards = resp.json()["columns"][0]["cards"]
    assert [c["id"] for c in backlog_cards] == ["2", "1"]


def test_move_card_across_columns(seeded_client):
    resp = seeded_client.patch("/api/cards/1/move", json={"target_column_id": "2", "target_index": 0})
    assert resp.status_code == 200
    board = resp.json()
    backlog_ids = [c["id"] for c in board["columns"][0]["cards"]]
    todo_ids = [c["id"] for c in board["columns"][1]["cards"]]
    assert "1" not in backlog_ids
    assert todo_ids[0] == "1"


def test_move_card_not_found(seeded_client):
    resp = seeded_client.patch("/api/cards/999/move", json={"target_column_id": "1", "target_index": 0})
    assert resp.status_code == 404


def test_move_card_invalid_target_column(seeded_client):
    resp = seeded_client.patch("/api/cards/1/move", json={"target_column_id": "999", "target_index": 0})
    assert resp.status_code == 404
