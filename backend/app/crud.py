from sqlalchemy.orm import Session

from app.models import BoardColumn, Card
from app.schemas import BoardOut, CardCreate, CardOut, CardUpdate, ColumnOut


def _card_out(card: Card) -> CardOut:
    return CardOut(id=str(card.id), title=card.title, details=card.details)


def _column_out(column: BoardColumn) -> ColumnOut:
    return ColumnOut(
        id=str(column.id),
        title=column.title,
        cards=[_card_out(card) for card in sorted(column.cards, key=lambda c: c.position)],
    )


def get_board(db: Session) -> BoardOut:
    columns = db.query(BoardColumn).order_by(BoardColumn.position).all()
    return BoardOut(columns=[_column_out(column) for column in columns])


def create_card(db: Session, data: CardCreate) -> CardOut | None:
    column = db.get(BoardColumn, int(data.column_id))
    if column is None:
        return None
    count = db.query(Card).filter(Card.column_id == column.id).count()
    card = Card(column_id=column.id, title=data.title, details=data.details, position=count)
    db.add(card)
    db.commit()
    db.refresh(card)
    return _card_out(card)


def update_card(db: Session, card_id: int, data: CardUpdate) -> CardOut | None:
    card = db.get(Card, card_id)
    if card is None:
        return None
    card.title = data.title
    card.details = data.details
    db.commit()
    db.refresh(card)
    return _card_out(card)


def delete_card(db: Session, card_id: int) -> bool:
    card = db.get(Card, card_id)
    if card is None:
        return False
    column_id = card.column_id
    db.delete(card)
    db.flush()
    remaining = db.query(Card).filter(Card.column_id == column_id).order_by(Card.position).all()
    for index, remaining_card in enumerate(remaining):
        remaining_card.position = index
    db.commit()
    return True


def move_card(db: Session, card_id: int, target_column_id: int, target_index: int) -> BoardOut | None:
    card = db.get(Card, card_id)
    if card is None:
        return None
    target_column = db.get(BoardColumn, target_column_id)
    if target_column is None:
        return None

    source_column_id = card.column_id
    source_cards = (
        db.query(Card)
        .filter(Card.column_id == source_column_id, Card.id != card_id)
        .order_by(Card.position)
        .all()
    )
    target_cards = (
        source_cards
        if target_column_id == source_column_id
        else db.query(Card).filter(Card.column_id == target_column_id).order_by(Card.position).all()
    )

    target_index = max(0, min(target_index, len(target_cards)))
    target_cards.insert(target_index, card)
    card.column_id = target_column_id

    if target_column_id != source_column_id:
        for index, source_card in enumerate(source_cards):
            source_card.position = index
    for index, target_card in enumerate(target_cards):
        target_card.position = index

    db.commit()
    return get_board(db)


def rename_column(db: Session, column_id: int, title: str) -> ColumnOut | None:
    column = db.get(BoardColumn, column_id)
    if column is None:
        return None
    column.title = title
    db.commit()
    db.refresh(column)
    return _column_out(column)
