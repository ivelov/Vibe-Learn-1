import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardProvider } from "@/context/BoardContext";
import { seedBoard } from "@/lib/seedData";
import { Board } from "./Board";

vi.mock("@/lib/api", () => ({
  getBoard: vi.fn(() => Promise.resolve(seedBoard)),
}));

describe("Board", () => {
  it("renders all five seeded columns with their titles", async () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    );
    for (const column of seedBoard.columns) {
      expect(await screen.findByText(column.title)).toBeInTheDocument();
    }
  });

  it("renders seeded cards", async () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    );
    expect(await screen.findByText("Research drag-and-drop libraries")).toBeInTheDocument();
  });
});
