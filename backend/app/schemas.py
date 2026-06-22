from pydantic import BaseModel


class CardOut(BaseModel):
    id: str
    title: str
    details: str


class ColumnOut(BaseModel):
    id: str
    title: str
    cards: list[CardOut]


class BoardOut(BaseModel):
    columns: list[ColumnOut]


class CardCreate(BaseModel):
    column_id: str
    title: str
    details: str


class CardUpdate(BaseModel):
    title: str
    details: str


class CardMove(BaseModel):
    target_column_id: str
    target_index: int


class ColumnUpdate(BaseModel):
    title: str
