"use client";

import { useState, type FormEvent } from "react";

export function AddCardModal({
  columnTitle,
  onSubmit,
  onClose,
}: {
  columnTitle: string;
  onSubmit: (title: string, details: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit(trimmedTitle, details.trim());
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-navy">Add card to {columnTitle}</h2>
        <label className="mt-4 block text-xs font-medium text-gray-text">Title</label>
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
          rows={3}
          className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-primary"
        />
        <div className="mt-4 flex justify-end gap-2">
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
            Add card
          </button>
        </div>
      </form>
    </div>
  );
}
