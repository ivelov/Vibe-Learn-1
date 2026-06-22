from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import crud
from app.database import Base, SessionLocal, engine, get_db
from app.schemas import BoardOut, CardCreate, CardMove, CardOut, CardUpdate, ColumnOut, ColumnUpdate
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/board", response_model=BoardOut)
def read_board(db: Session = Depends(get_db)):
    return crud.get_board(db)


@app.post("/api/cards", response_model=CardOut, status_code=201)
def create_card(data: CardCreate, db: Session = Depends(get_db)):
    card = crud.create_card(db, data)
    if card is None:
        raise HTTPException(status_code=404, detail="Column not found")
    return card


@app.patch("/api/cards/{card_id}", response_model=CardOut)
def update_card(card_id: int, data: CardUpdate, db: Session = Depends(get_db)):
    card = crud.update_card(db, card_id, data)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@app.delete("/api/cards/{card_id}", status_code=204)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    if not crud.delete_card(db, card_id):
        raise HTTPException(status_code=404, detail="Card not found")


@app.patch("/api/cards/{card_id}/move", response_model=BoardOut)
def move_card(card_id: int, data: CardMove, db: Session = Depends(get_db)):
    board = crud.move_card(db, card_id, int(data.target_column_id), data.target_index)
    if board is None:
        raise HTTPException(status_code=404, detail="Card or column not found")
    return board


@app.patch("/api/columns/{column_id}", response_model=ColumnOut)
def rename_column(column_id: int, data: ColumnUpdate, db: Session = Depends(get_db)):
    column = crud.rename_column(db, column_id, data.title)
    if column is None:
        raise HTTPException(status_code=404, detail="Column not found")
    return column
