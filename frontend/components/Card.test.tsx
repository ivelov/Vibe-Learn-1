import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Card } from "./Card";

const card = { id: "card-1", title: "Test card", details: "Test details" };

function renderCard(onClick?: () => void) {
  return render(
    <DndContext>
      <SortableContext items={[card.id]}>
        <Card card={card} onClick={onClick} />
      </SortableContext>
    </DndContext>
  );
}

describe("Card", () => {
  it("renders the card title and details", () => {
    renderCard();
    expect(screen.getByText("Test card")).toBeInTheDocument();
    expect(screen.getByText("Test details")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    renderCard(onClick);
    fireEvent.click(screen.getByText("Test card"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
