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
import { Column } from "./Column";
import { AddCardModal } from "./AddCardModal";
import { CardDetailModal } from "./CardDetailModal";
import type { Card as CardType } from "@/lib/types";

export function Board() {
  const { state, dispatch } = useBoard();
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

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const overId = String(over.id);
    if (cardId === overId) return;

    const sourceColumnId = findColumnIdByCardId(cardId);
    if (!sourceColumnId) return;

    const overColumn = state.columns.find((column) => column.id === overId);
    if (overColumn) {
      dispatch({
        type: "MOVE_CARD",
        cardId,
        sourceColumnId,
        targetColumnId: overColumn.id,
        targetIndex: overColumn.cardIds.length,
      });
      return;
    }

    const targetColumn = state.columns.find((column) => column.cardIds.includes(overId));
    if (!targetColumn) return;

    dispatch({
      type: "MOVE_CARD",
      cardId,
      sourceColumnId,
      targetColumnId: targetColumn.id,
      targetIndex: targetColumn.cardIds.indexOf(overId),
    });
  }

  const addCardColumn = state.columns.find((column) => column.id === addCardColumnId);

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
              onRename={(columnId, title) => dispatch({ type: "RENAME_COLUMN", columnId, title })}
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
          onSubmit={(title, details) => {
            dispatch({ type: "ADD_CARD", columnId: addCardColumn.id, title, details });
            setAddCardColumnId(null);
          }}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={(title, details) => {
            dispatch({ type: "UPDATE_CARD", cardId: selectedCard.id, title, details });
            setSelectedCard(null);
          }}
          onDelete={() => {
            const columnId = findColumnIdByCardId(selectedCard.id);
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
