import { test, expect, type Page } from "@playwright/test";

async function dragCard(page: Page, cardText: string, targetText: string) {
  const card = page.getByText(cardText, { exact: true });
  const target = page.getByText(targetText, { exact: true });
  const cardBox = await card.boundingBox();
  const targetBox = await target.boundingBox();
  if (!cardBox || !targetBox) throw new Error("Could not locate drag source or target");

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 10, { steps: 10 });
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 15, { steps: 5 });
  await page.mouse.up();
}

test("golden path: persisted data, drag, add, delete, rename, reload", async ({ page }) => {
  await page.goto("/");

  // Board now loads asynchronously from the API; wait for it explicitly.
  await expect(page.getByText("Kanban Board")).toBeVisible();
  await expect(page.getByText("Backlog")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("To Do")).toBeVisible();
  await expect(page.getByText("In Progress")).toBeVisible();
  await expect(page.getByText("In Review")).toBeVisible();
  await expect(page.getByText("Done")).toBeVisible();
  await expect(page.getByText("Research drag-and-drop libraries")).toBeVisible();

  const backlogColumn = page.locator("div.rounded-xl", { hasText: "Backlog" });
  const toDoColumn = page.locator("div.rounded-xl", { hasText: "To Do" });

  await dragCard(page, "Research drag-and-drop libraries", "Set up project scaffolding");
  await expect(toDoColumn.getByText("Research drag-and-drop libraries")).toBeVisible();
  await expect(backlogColumn.getByText("Research drag-and-drop libraries")).toHaveCount(0);

  await page.getByRole("button", { name: "+ Add card" }).first().click();
  await page.locator("form input").fill("E2E added card");
  await page.locator("form textarea").fill("Added during E2E test");
  await page.getByRole("button", { name: "Add card", exact: true }).click();
  await expect(page.getByText("E2E added card")).toBeVisible();

  // Persistence check: the moved card and the added card both survive a reload.
  await page.reload();
  await expect(page.getByText("E2E added card")).toBeVisible({ timeout: 10_000 });
  await expect(toDoColumn.getByText("Research drag-and-drop libraries")).toBeVisible();

  await page.getByText("E2E added card").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("E2E added card")).toHaveCount(0);

  await page.getByText("Backlog", { exact: true }).click();
  await page.locator("input").first().fill("Ideas");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Ideas", { exact: true })).toBeVisible();

  // Delete persists too.
  await page.reload();
  await expect(page.getByText("E2E added card")).toHaveCount(0);
});
