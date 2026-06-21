import type { BoardState } from "./types";

export const seedBoard: BoardState = {
  columns: [
    { id: "col-1", title: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "col-2", title: "To Do", cardIds: ["card-3", "card-4", "card-5"] },
    { id: "col-3", title: "In Progress", cardIds: ["card-6"] },
    { id: "col-4", title: "In Review", cardIds: ["card-7"] },
    { id: "col-5", title: "Done", cardIds: ["card-8", "card-9"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Research drag-and-drop libraries",
      details: "Compare dnd-kit against alternatives for accessibility and touch support.",
    },
    "card-2": {
      id: "card-2",
      title: "Define color palette tokens",
      details: "Translate brand colors into Tailwind theme variables.",
    },
    "card-3": {
      id: "card-3",
      title: "Set up project scaffolding",
      details: "Initialize Next.js app with TypeScript, Tailwind, and ESLint.",
    },
    "card-4": {
      id: "card-4",
      title: "Design card component",
      details: "Soft-elevated style with title and details preview.",
    },
    "card-5": {
      id: "card-5",
      title: "Write reducer unit tests",
      details: "Cover move, add, delete, and rename actions.",
    },
    "card-6": {
      id: "card-6",
      title: "Build column drag targets",
      details: "Wire up droppable zones for each column.",
    },
    "card-7": {
      id: "card-7",
      title: "Add card detail modal",
      details: "Allow viewing and editing a card's title and details.",
    },
    "card-8": {
      id: "card-8",
      title: "Write project README",
      details: "Document stack, setup, and test commands.",
    },
    "card-9": {
      id: "card-9",
      title: "Pick brand colors",
      details: "Five colors chosen for headings, links, actions, and accents.",
    },
  },
};
