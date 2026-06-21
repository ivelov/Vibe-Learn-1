import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { Column } from "./Column";
import type { Column as ColumnType } from "@/lib/types";

const column: ColumnType = { id: "col-1", title: "Backlog", cardIds: ["card-1"] };
const cards = [{ id: "card-1", title: "First card", details: "First details" }];

function renderColumn(overrides: Partial<React.ComponentProps<typeof Column>> = {}) {
  const onAddCard = vi.fn();
  const onCardClick = vi.fn();
  const onRename = vi.fn();
  render(
    <DndContext>
      <Column
        column={column}
        cards={cards}
        onAddCard={onAddCard}
        onCardClick={onCardClick}
        onRename={onRename}
        {...overrides}
      />
    </DndContext>
  );
  return { onAddCard, onCardClick, onRename };
}

describe("Column", () => {
  it("renders the column title, card count, and cards", () => {
    renderColumn();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("First card")).toBeInTheDocument();
  });

  it("calls onAddCard when the add card button is clicked", async () => {
    const { onAddCard } = renderColumn();
    await userEvent.click(screen.getByRole("button", { name: "+ Add card" }));
    expect(onAddCard).toHaveBeenCalledWith("col-1");
  });

  it("renames the column on blur after editing the title", async () => {
    const { onRename } = renderColumn();
    await userEvent.click(screen.getByText("Backlog"));
    const input = screen.getByDisplayValue("Backlog");
    await userEvent.clear(input);
    await userEvent.type(input, "Ideas");
    await userEvent.tab();
    expect(onRename).toHaveBeenCalledWith("col-1", "Ideas");
  });
});
