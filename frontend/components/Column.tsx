"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card as CardType, Column as ColumnType } from "@/lib/types";
import { Card } from "./Card";

export function Column({
  column,
  cards,
  onAddCard,
  onCardClick,
  onRename,
}: {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onCardClick: (card: CardType) => void;
  onRename: (columnId: string, title: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  function handleRenameSubmit() {
    setIsEditing(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== column.title) {
      onRename(column.id, trimmed);
    } else {
      setTitle(column.title);
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100 p-3">
      <div className="mb-3 flex items-center justify-between border-b-2 border-accent-yellow pb-2">
        {isEditing ? (
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleRenameSubmit();
              if (event.key === "Escape") {
                setTitle(column.title);
                setIsEditing(false);
              }
            }}
            className="w-full rounded border border-blue-primary/40 px-1 text-sm font-semibold text-navy focus:outline-none"
          />
        ) : (
          <h2
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-sm font-semibold text-navy"
          >
            {column.title}
          </h2>
        )}
        <span className="text-xs text-gray-text">{cards.length}</span>
      </div>
      <div ref={setNodeRef} className="flex min-h-10 flex-col gap-2">
        <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>
      <button
        type="button"
        onClick={() => onAddCard(column.id)}
        className="mt-3 rounded-lg border border-dashed border-blue-primary/40 py-2 text-sm text-blue-primary transition-colors hover:bg-blue-primary/5"
      >
        + Add card
      </button>
    </div>
  );
}
