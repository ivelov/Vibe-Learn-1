"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { BoardState, Card } from "@/lib/types";
import { seedBoard } from "@/lib/seedData";

export type BoardAction =
  | {
      type: "MOVE_CARD";
      cardId: string;
      sourceColumnId: string;
      targetColumnId: string;
      targetIndex: number;
    }
  | { type: "ADD_CARD"; columnId: string; title: string; details: string }
  | { type: "DELETE_CARD"; cardId: string; columnId: string }
  | { type: "RENAME_COLUMN"; columnId: string; title: string }
  | { type: "UPDATE_CARD"; cardId: string; title: string; details: string };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
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
      const id = `card-${crypto.randomUUID()}`;
      const newCard: Card = { id, title: action.title, details: action.details };
      const columns = state.columns.map((column) =>
        column.id === action.columnId
          ? { ...column, cardIds: [...column.cardIds, id] }
          : column
      );
      return {
        columns,
        cards: { ...state.cards, [id]: newCard },
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
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, seedBoard);
  return <BoardContext.Provider value={{ state, dispatch }}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
