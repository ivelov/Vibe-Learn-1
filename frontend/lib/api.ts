import type { BoardState, Card } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CardOut {
  id: string;
  title: string;
  details: string;
}

interface ColumnOut {
  id: string;
  title: string;
  cards: CardOut[];
}

interface BoardOut {
  columns: ColumnOut[];
}

function mapBoardOutToState(board: BoardOut): BoardState {
  const cards: Record<string, Card> = {};
  const columns = board.columns.map((column) => {
    for (const card of column.cards) {
      cards[card.id] = card;
    }
    return { id: column.id, title: column.title, cardIds: column.cards.map((card) => card.id) };
  });
  return { columns, cards };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${options?.method ?? "GET"} ${path} (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function getBoard(): Promise<BoardState> {
  const board = await request<BoardOut>("/api/board");
  return mapBoardOutToState(board);
}

export async function createCard(columnId: string, title: string, details: string): Promise<Card> {
  return request<CardOut>("/api/cards", {
    method: "POST",
    body: JSON.stringify({ column_id: columnId, title, details }),
  });
}

export async function updateCard(cardId: string, title: string, details: string): Promise<Card> {
  return request<CardOut>(`/api/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({ title, details }),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  await request<void>(`/api/cards/${cardId}`, { method: "DELETE" });
}

export async function moveCard(
  cardId: string,
  targetColumnId: string,
  targetIndex: number
): Promise<BoardState> {
  const board = await request<BoardOut>(`/api/cards/${cardId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ target_column_id: targetColumnId, target_index: targetIndex }),
  });
  return mapBoardOutToState(board);
}

export async function renameColumn(columnId: string, title: string): Promise<void> {
  await request<ColumnOut>(`/api/columns/${columnId}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}
