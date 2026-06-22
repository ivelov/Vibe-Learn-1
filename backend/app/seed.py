from sqlalchemy.orm import Session

from app.models import BoardColumn, Card

SEED_COLUMNS = [
    {
        "title": "Backlog",
        "cards": [
            (
                "Research drag-and-drop libraries",
                "Compare dnd-kit against alternatives for accessibility and touch support.",
            ),
            (
                "Define color palette tokens",
                "Translate brand colors into Tailwind theme variables.",
            ),
        ],
    },
    {
        "title": "To Do",
        "cards": [
            (
                "Set up project scaffolding",
                "Initialize Next.js app with TypeScript, Tailwind, and ESLint.",
            ),
            (
                "Design card component",
                "Soft-elevated style with title and details preview.",
            ),
            (
                "Write reducer unit tests",
                "Cover move, add, delete, and rename actions.",
            ),
        ],
    },
    {
        "title": "In Progress",
        "cards": [
            (
                "Build column drag targets",
                "Wire up droppable zones for each column.",
            ),
        ],
    },
    {
        "title": "In Review",
        "cards": [
            (
                "Add card detail modal",
                "Allow viewing and editing a card's title and details.",
            ),
        ],
    },
    {
        "title": "Done",
        "cards": [
            (
                "Write project README",
                "Document stack, setup, and test commands.",
            ),
            (
                "Pick brand colors",
                "Five colors chosen for headings, links, actions, and accents.",
            ),
        ],
    },
]


def seed_if_empty(db: Session) -> None:
    if db.query(BoardColumn).first() is not None:
        return

    for column_position, column_data in enumerate(SEED_COLUMNS):
        column = BoardColumn(title=column_data["title"], position=column_position)
        db.add(column)
        db.flush()
        for card_position, (title, details) in enumerate(column_data["cards"]):
            db.add(
                Card(
                    column_id=column.id,
                    title=title,
                    details=details,
                    position=card_position,
                )
            )
    db.commit()
