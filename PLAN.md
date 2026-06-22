# Kanban Backend: FastAPI + MySQL + Docker

## Context

The Kanban MVP currently lives entirely in the browser (frontend/, Next.js + React Context/reducer, no persistence — by original design). The user now wants to split the app into frontend + backend, with the board persisted in MySQL via a FastAPI backend, and the whole stack containerized with Docker. This supersedes the original "no persistence" constraint in CLAUDE.md; all other business rules still apply (1 board, 5 fixed renameable columns, cards have title+details only, drag-and-drop, add/delete cards, dummy data on first load).

Note: `backend/.env` currently has an unrelated `OPENROUTER_KEY` — per user instruction, keep it as-is and add `DATABASE_URL` alongside it.

## Architecture decisions

- **DB schema**: two tables only — `columns` (id, title, position) and `cards` (id, column_id FK, title, details, position). No `boards` table; the 5 columns are the one board.
- **IDs**: auto-increment integer PKs server-side. Pydantic schemas serialize ids as `str` in JSON so the frontend's existing `id: string` types need no changes. Frontend drops `crypto.randomUUID()` — the server now assigns ids on `ADD_CARD`.
- **Ordering**: `position` int, 0-indexed, contiguous per parent. The move endpoint renumbers `position` server-side (same splice semantics as the existing reducer). `GET /api/board` returns cards pre-sorted by `position`.
- **Migrations**: `Base.metadata.create_all()` on startup, no Alembic — fixed 2-table schema, no expected churn.
- **Seeding**: idempotent startup check — if `columns` is empty, insert the 5 fixed columns + 9 dummy cards (same content as `frontend/lib/seedData.ts`).
- **Move sync**: pessimistic — frontend awaits the move API call, then dispatches the local reducer action. Applies the same await-then-dispatch pattern to all five mutating actions for consistency; no optimistic rollback logic needed anywhere.
- **Frontend integration**: keep the existing pure `boardReducer` (already unit-tested) unchanged in its 5 existing cases. Add one new `SET_BOARD` case for the initial fetch. `Board.tsx` handlers become `async`: call the API, then dispatch using server-confirmed data.

## Phase A — Backend scaffolding + DB schema + seed

Create:
- `backend/requirements.txt` — fastapi, uvicorn[standard], sqlalchemy>=2.0, pymysql, pydantic, python-dotenv, pytest, httpx
- `backend/app/__init__.py`
- `backend/app/database.py` — engine from `DATABASE_URL` env, `SessionLocal`, `Base`, `get_db()` dependency
- `backend/app/models.py` — SQLAlchemy `Column(id, title, position)`, `Card(id, column_id FK, title, details, position)`
- `backend/app/seed.py` — seed constants mirroring `frontend/lib/seedData.ts`, `seed_if_empty(db)`
- `backend/app/main.py` — FastAPI app, lifespan hook calling `Base.metadata.create_all()` + `seed_if_empty()`, CORS

Modify:
- `backend/.env` — add `DATABASE_URL=mysql+pymysql://kanban:kanban@localhost:3306/kanban` alongside existing `OPENROUTER_KEY`
- `backend/.gitignore` — keep `.env`; add `__pycache__/`, `*.pyc`, `.venv/`

Success: `uvicorn app.main:app --reload` against local MySQL creates tables + seeds exactly 5 columns/9 cards once; restart doesn't duplicate.

## Phase B — API endpoints + schemas + backend tests

Create:
- `backend/app/schemas.py` — `CardOut`, `ColumnOut`, `BoardOut`, `CardCreate`, `CardUpdate`, `CardMove{target_column_id, target_index}`, `ColumnUpdate`
- `backend/app/crud.py` — `get_board`, `create_card`, `update_card`, `delete_card`, `move_card` (renumbers positions), `rename_column`
- `backend/tests/conftest.py` — SQLite in-memory engine, `get_db` override, `TestClient` fixture
- `backend/tests/test_board.py`, `test_cards.py`, `test_move.py`, `test_columns.py`

Modify `backend/app/main.py` — routes:
- `GET /api/board` -> `BoardOut`
- `POST /api/cards` -> 201 `CardOut`
- `PATCH /api/cards/{id}` -> `CardOut`
- `DELETE /api/cards/{id}` -> 204
- `PATCH /api/cards/{id}/move` -> `BoardOut` (return full board for simple resync)
- `PATCH /api/columns/{id}` -> `ColumnOut`

Success: `pytest backend/tests -v` green on SQLite; manual `/docs` smoke test against real MySQL for all 6 endpoints; move logic matches existing reducer's `MOVE_CARD` test cases for equivalent operations.

## Phase C — Docker Compose for db + backend

Create:
- `backend/Dockerfile` — `python:3.12-slim`, pip install, `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- `docker-compose.yml` (repo root) — `db` (mysql:8, named volume, healthcheck), `backend` (build ./backend, depends_on db healthy, `DATABASE_URL` pointing at `db` service host, port 8000)

Success: `docker compose up db backend` -> healthy MySQL then backend; `curl localhost:8000/api/board` returns seeded JSON; `down -v && up` re-seeds cleanly.

## Phase D — Frontend API integration

Create:
- `frontend/lib/api.ts` — fetch wrapper keyed on `NEXT_PUBLIC_API_URL`: `getBoard()`, `createCard()`, `updateCard()`, `deleteCard()`, `moveCard()`, `renameColumn()`, plus a mapper from the API's nested response to the existing flat `BoardState`
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:8000`

Modify:
- `frontend/context/BoardContext.tsx` — `BoardProvider` fetches via `api.getBoard()` on mount instead of static `seedBoard` import; dispatches new `SET_BOARD` action; exposes a `loading` flag. `ADD_CARD` action shape changes to take a server-confirmed `card` object instead of generating an id internally.
- `frontend/components/Board.tsx` — all 5 handlers become async: await the API call, then dispatch with confirmed data (pessimistic, per decision above)
- Reducer/component tests — update only the `ADD_CARD` test to pass a pre-built card; other 4 reducer tests unaffected

Success: `npm run dev` against running backend shows seeded board; add/delete/move/rename/edit round-trip through API and survive a page refresh; `npm run test` green.

## Phase E — Dockerize frontend + full-stack compose

Create:
- `frontend/Dockerfile` — multi-stage (deps -> builder with `ARG NEXT_PUBLIC_API_URL` -> runner), port 3000. Since the app is client-rendered, `NEXT_PUBLIC_API_URL` must be the browser-reachable URL (`http://localhost:8000`), not the Docker-internal service name.

Modify:
- `docker-compose.yml` — add `frontend` service (build ./frontend, build arg `NEXT_PUBLIC_API_URL=http://localhost:8000`, depends_on backend, port 3000)
- `backend/app/main.py` — CORS `allow_origins=["http://localhost:3000"]`

Success: `docker compose up` brings up all three services; `localhost:3000` shows a fully functional, persisted board; fresh volume re-seeds and works end-to-end.

## Phase F — Testing / verification end-to-end

Modify:
- `frontend/e2e/kanban.spec.ts` — wait for the board to actually load (no more synchronous seed data) before interacting; run against the full `docker compose up` stack

Success: `pytest backend/tests` green; `npm run test` green; `npm run e2e` green against the compose stack (add/delete/move/rename/edit + reload-survives-state check); manual restart of `backend`+`db` containers confirms data persists via the named volume.

## Summary of files

**Backend (new):** requirements.txt, app/__init__.py, app/database.py, app/models.py, app/schemas.py, app/crud.py, app/seed.py, app/main.py, Dockerfile, tests/conftest.py, tests/test_board.py, tests/test_cards.py, tests/test_move.py, tests/test_columns.py
**Backend (modify):** .env (add DATABASE_URL), .gitignore (add Python ignores)
**Frontend (new):** lib/api.ts, .env.local, Dockerfile
**Frontend (modify):** context/BoardContext.tsx, components/Board.tsx, reducer test for ADD_CARD, e2e/kanban.spec.ts
**Root (new):** docker-compose.yml

### Critical files
- backend/app/main.py
- backend/app/models.py
- backend/app/crud.py
- frontend/context/BoardContext.tsx
- frontend/components/Board.tsx
- frontend/lib/api.ts
- docker-compose.yml
