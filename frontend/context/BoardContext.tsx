"use client";

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import type { BoardState, Card } from "@/lib/types";
import { getBoard } from "@/lib/api";

export type BoardAction =
  | { type: "SET_BOARD"; board: BoardState }
  | {
      type: "MOVE_CARD";
      cardId: string;
      sourceColumnId: string;
      targetColumnId: string;
      targetIndex: number;
    }
  | { type: "ADD_CARD"; columnId: string; card: Card }
  | { type: "DELETE_CARD"; cardId: string; columnId: string }
  | { type: "RENAME_COLUMN"; columnId: string; title: string }
  | { type: "UPDATE_CARD"; cardId: string; title: string; details: string };

const emptyBoard: BoardState = { columns: [], cards: {} };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SET_BOARD": {
      return action.board;
    }
    case "MOVE_CARD": {
      const { cardId, sourceColumnId, targetColumnId, targetIndex } = action;
      const columns = state.columns.map((column) => ({ ...column, cardIds: [...column.cardIds] }));
      const sourceColumn = columns.find((column) => column.id === sourceColumnId);
      const targetColumn = columns.find((column) => column.id === targetColumnId);
      if (!sourceColumn || !targetColumn) return state;

      const removalIndex = sourceColumn.cardIds.indexOf(cardId);
      if (removalIndex === -1) return state;
      sourceColumn.cardIds.splice(removalIndex, 1);
      targetColumn.cardIds.splice(targetIndex, 0, cardId);

      return { ...state, columns };
    }
    case "ADD_CARD": {
      const { card } = action;
      const columns = state.columns.map((column) =>
        column.id === action.columnId
          ? { ...column, cardIds: [...column.cardIds, card.id] }
          : column
      );
      return {
        columns,
        cards: { ...state.cards, [card.id]: card },
      };
    }
    case "DELETE_CARD": {
      const columns = state.columns.map((column) =>
        column.id === action.columnId
          ? { ...column, cardIds: column.cardIds.filter((id) => id !== action.cardId) }
          : column
      );
      const cards = { ...state.cards };
      delete cards[action.cardId];
      return { columns, cards };
    }
    case "RENAME_COLUMN": {
      const columns = state.columns.map((column) =>
        column.id === action.columnId ? { ...column, title: action.title } : column
      );
      return { ...state, columns };
    }
    case "UPDATE_CARD": {
      const existing = state.cards[action.cardId];
      if (!existing) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { ...existing, title: action.title, details: action.details },
        },
      };
    }
    default:
      return state;
  }
}

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  loading: boolean;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, emptyBoard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBoard().then((board) => {
      dispatch({ type: "SET_BOARD", board });
      setLoading(false);
    });
  }, []);

  return (
    <BoardContext.Provider value={{ state, dispatch, loading }}>{children}</BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
