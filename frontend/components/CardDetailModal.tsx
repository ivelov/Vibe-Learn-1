"use client";

import { useState, type FormEvent } from "react";
import type { Card as CardType } from "@/lib/types";

export function CardDetailModal({
  card,
  onSave,
  onDelete,
  onClose,
}: {
  card: CardType;
  onSave: (title: string, details: string) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [details, setDetails] = useState(card.details);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSave(trimmedTitle, details.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSave}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        <label className="block text-xs font-medium text-gray-text">Title</label>
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-primary"
        />
        <label className="mt-3 block text-xs font-medium text-gray-text">Details</label>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-primary"
        />
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm text-gray-text hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-purple-secondary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
