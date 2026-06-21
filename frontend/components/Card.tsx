"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType } from "@/lib/types";

export function Card({ card, onClick }: { card: CardType; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-pointer rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <p className="text-sm font-medium text-navy">{card.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-gray-text">{card.details}</p>
    </div>
  );
}
