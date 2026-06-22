"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBoard } from "@/context/BoardContext";
import * as api from "@/lib/api";
import { Column } from "./Column";
import { AddCardModal } from "./AddCardModal";
import { CardDetailModal } from "./CardDetailModal";
import type { Card as CardType } from "@/lib/types";

export function Board() {
  const { state, dispatch, loading } = useBoard();
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [addCardColumnId, setAddCardColumnId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  function findColumnIdByCardId(cardId: string) {
    return state.columns.find((column) => column.cardIds.includes(cardId))?.id;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveCard(state.cards[String(event.active.id)] ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const overId = String(over.id);
    if (cardId === overId) return;

    const sourceColumnId = findColumnIdByCardId(cardId);
    if (!sourceColumnId) return;

    const overColumn = state.columns.find((column) => column.id === overId);
    const targetColumnId = overColumn
      ? overColumn.id
      : state.columns.find((column) => column.cardIds.includes(overId))?.id;
    if (!targetColumnId) return;

    const targetIndex = overColumn
      ? overColumn.cardIds.length
      : state.columns.find((column) => column.id === targetColumnId)!.cardIds.indexOf(overId);

    const board = await api.moveCard(cardId, targetColumnId, targetIndex);
    dispatch({ type: "SET_BOARD", board });
  }

  const addCardColumn = state.columns.find((column) => column.id === addCardColumnId);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-text">Loading board...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/5 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-navy">Kanban Board</h1>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {state.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              cards={column.cardIds.map((id) => state.cards[id]).filter(Boolean)}
              onAddCard={setAddCardColumnId}
              onCardClick={setSelectedCard}
              onRename={async (columnId, title) => {
                await api.renameColumn(columnId, title);
                dispatch({ type: "RENAME_COLUMN", columnId, title });
              }}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? (
            <div className="rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
              <p className="text-sm font-medium text-navy">{activeCard.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-text">{activeCard.details}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {addCardColumn && (
        <AddCardModal
          columnTitle={addCardColumn.title}
          onClose={() => setAddCardColumnId(null)}
          onSubmit={async (title, details) => {
            const card = await api.createCard(addCardColumn.id, title, details);
            dispatch({ type: "ADD_CARD", columnId: addCardColumn.id, card });
            setAddCardColumnId(null);
          }}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={async (title, details) => {
            await api.updateCard(selectedCard.id, title, details);
            dispatch({ type: "UPDATE_CARD", cardId: selectedCard.id, title, details });
            setSelectedCard(null);
          }}
          onDelete={async () => {
            const columnId = findColumnIdByCardId(selectedCard.id);
            await api.deleteCard(selectedCard.id);
            if (columnId) {
              dispatch({ type: "DELETE_CARD", cardId: selectedCard.id, columnId });
            }
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
}
