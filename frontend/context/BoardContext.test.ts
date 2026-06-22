import { describe, it, expect } from "vitest";
import { boardReducer, type BoardAction } from "./BoardContext";
import type { BoardState } from "@/lib/types";

function makeState(): BoardState {
  return {
    columns: [
      { id: "col-1", title: "Backlog", cardIds: ["card-1", "card-2"] },
      { id: "col-2", title: "To Do", cardIds: ["card-3"] },
      { id: "col-3", title: "Done", cardIds: [] },
    ],
    cards: {
      "card-1": { id: "card-1", title: "First", details: "First details" },
      "card-2": { id: "card-2", title: "Second", details: "Second details" },
      "card-3": { id: "card-3", title: "Third", details: "Third details" },
    },
  };
}

describe("boardReducer", () => {
  it("moves a card across columns", () => {
    const action: BoardAction = {
      type: "MOVE_CARD",
      cardId: "card-1",
      sourceColumnId: "col-1",
      targetColumnId: "col-3",
      targetIndex: 0,
    };
    const result = boardReducer(makeState(), action);
    expect(result.columns[0].cardIds).toEqual(["card-2"]);
    expect(result.columns[2].cardIds).toEqual(["card-1"]);
  });

  it("reorders a card within the same column", () => {
    const action: BoardAction = {
      type: "MOVE_CARD",
      cardId: "card-1",
      sourceColumnId: "col-1",
      targetColumnId: "col-1",
      targetIndex: 1,
    };
    const result = boardReducer(makeState(), action);
    expect(result.columns[0].cardIds).toEqual(["card-2", "card-1"]);
  });

  it("appends a card to an empty column", () => {
    const action: BoardAction = {
      type: "MOVE_CARD",
      cardId: "card-3",
      sourceColumnId: "col-2",
      targetColumnId: "col-3",
      targetIndex: 0,
    };
    const result = boardReducer(makeState(), action);
    expect(result.columns[1].cardIds).toEqual([]);
    expect(result.columns[2].cardIds).toEqual(["card-3"]);
  });

  it("adds a server-confirmed card to a column", () => {
    const card = { id: "card-9", title: "New card", details: "New details" };
    const action: BoardAction = { type: "ADD_CARD", columnId: "col-3", card };
    const result = boardReducer(makeState(), action);
    expect(result.columns[2].cardIds).toEqual(["card-9"]);
    expect(result.cards["card-9"]).toEqual(card);
  });

  it("replaces the entire board on SET_BOARD", () => {
    const board: BoardState = {
      columns: [{ id: "col-9", title: "Fresh", cardIds: [] }],
      cards: {},
    };
    const action: BoardAction = { type: "SET_BOARD", board };
    const result = boardReducer(makeState(), action);
    expect(result).toEqual(board);
  });

  it("deletes a card from its column", () => {
    const action: BoardAction = { type: "DELETE_CARD", cardId: "card-1", columnId: "col-1" };
    const result = boardReducer(makeState(), action);
    expect(result.columns[0].cardIds).toEqual(["card-2"]);
    expect(result.cards["card-1"]).toBeUndefined();
  });

  it("deletes the last card in a column, leaving it empty", () => {
    const action: BoardAction = { type: "DELETE_CARD", cardId: "card-3", columnId: "col-2" };
    const result = boardReducer(makeState(), action);
    expect(result.columns[1].cardIds).toEqual([]);
  });

  it("renames a column", () => {
    const action: BoardAction = { type: "RENAME_COLUMN", columnId: "col-1", title: "Ideas" };
    const result = boardReducer(makeState(), action);
    expect(result.columns[0].title).toBe("Ideas");
    expect(result.columns[1].title).toBe("To Do");
  });

  it("updates a card's title and details", () => {
    const action: BoardAction = {
      type: "UPDATE_CARD",
      cardId: "card-1",
      title: "Updated title",
      details: "Updated details",
    };
    const result = boardReducer(makeState(), action);
    expect(result.cards["card-1"]).toEqual({
      id: "card-1",
      title: "Updated title",
      details: "Updated details",
    });
  });
});
