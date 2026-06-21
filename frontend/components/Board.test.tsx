import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardProvider } from "@/context/BoardContext";
import { seedBoard } from "@/lib/seedData";
import { Board } from "./Board";

describe("Board", () => {
  it("renders all five seeded columns with their titles", () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    );
    for (const column of seedBoard.columns) {
      expect(screen.getByText(column.title)).toBeInTheDocument();
    }
  });

  it("renders seeded cards", () => {
    render(
      <BoardProvider>
        <Board />
      </BoardProvider>
    );
    expect(screen.getByText("Research drag-and-drop libraries")).toBeInTheDocument();
  });
});
