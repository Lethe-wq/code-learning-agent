# Code Mentor

Code Mentor is a local-first code knowledge explanation assistant. The MVP helps users understand Python, C++, SQL, and algorithm concepts through structured explanations, examples, comparisons, follow-up questions, notes, and review states.

The product is intentionally not quiz-first. The core experience is:

```text
Enter a learning intent
-> Generate a structured lesson
-> Read the lesson in a focused page
-> Ask follow-up questions or request rephrasing/examples/comparisons
-> Save notes, favorites, and review status locally
```

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router, Vitest
- Backend: FastAPI, SQLModel, SQLite, Pydantic, pytest
- LLM: DeepSeek OpenAI-compatible API
- Storage: local SQLite database
- Authentication: none in the MVP

## Project Structure

```text
.
|-- backend/                 # FastAPI backend
|   |-- app/
|   |   |-- api/             # Thin FastAPI routers
|   |   |-- db/              # SQLite engine/session/init
|   |   |-- llm/             # DeepSeek client, PromptBuilder, ContextBuilder
|   |   |-- models/          # SQLModel tables
|   |   |-- schemas/         # Pydantic request/response schemas
|   |   `-- services/        # Business logic
|   |-- tests/               # pytest tests
|   `-- pyproject.toml
|-- docs/
|   |-- api-contract.md      # Frontend/backend contract
|   |-- backend-design.md    # Backend design notes
|   `-- frontend-design.md   # Frontend design notes
`-- frontend/                # React frontend
    |-- src/
    |   |-- api/             # Typed API client and contract types
    |   |-- test/            # Test fixtures and fetch mock helper
    |   |-- App.tsx
    |   `-- styles.css
    |-- package.json
    `-- vite.config.ts
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm

## Backend Setup

From the project root:

```powershell
cd backend
python -m pip install -e .[dev]
```

Run tests:

```powershell
python -m pytest
```

Start the API server:

```powershell
python -m uvicorn app.main:app --reload
```

The backend runs at:

```text
http://localhost:8000
```

## Frontend Setup

From the project root:

```powershell
cd frontend
npm.cmd install
```

Run tests:

```powershell
npm.cmd test -- --run
```

Build:

```powershell
npm.cmd run build
```

Start the dev server:

```powershell
npm.cmd run dev
```

The frontend runs at:

```text
http://localhost:5173
```

By default the frontend calls:

```text
http://localhost:8000/api
```

Override the API base URL with:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000"
```

## DeepSeek Configuration

The backend uses a DeepSeek OpenAI-compatible client. Configure it with environment variables:

```powershell
$env:DEEPSEEK_API_KEY="your_key"
$env:DEEPSEEK_BASE_URL="https://api.deepseek.com"
$env:DEEPSEEK_MODEL="deepseek-v4-flash"
```

Or edit the local backend env file:

```text
backend/.env
```

Use `backend/.env.example` as the template. `backend/.env` is ignored by git so real API keys are not committed.

Tests use a fake LLM client and do not require a real DeepSeek API key.

## Main API Endpoints

See [docs/api-contract.md](docs/api-contract.md) for the full contract.

Core endpoints:

- `POST /api/lessons`
- `GET /api/lessons/{id}`
- `GET /api/lessons?limit=20`
- `PATCH /api/lessons/{id}`
- `POST /api/lessons/{id}/actions`
- `POST /api/lessons/{id}/ask`
- `POST /api/notes`
- `GET /api/notes?lesson_id=...`
- `GET /api/profile`

## Design Principles

- Keep the app local-first and single-user for the MVP.
- Treat `Lesson` as the core resource, not chat.
- Store lesson content as structured JSON, not raw Markdown.
- Keep API routers thin and business logic in services.
- Keep LLM calls behind `LLMClient`.
- Keep prompt assembly centralized in `PromptBuilder` and `ContextBuilder`.
- Leave extension points for future streaming output and RAG without implementing them in the MVP.
- Keep frontend quick actions visible but never covering the lesson reading content.

## Verification Commands

Run backend tests:

```powershell
cd backend
python -m pytest
```

Run frontend tests:

```powershell
cd frontend
npm.cmd test -- --run
```

Run frontend build:

```powershell
cd frontend
npm.cmd run build
```

## MVP Limitations

- No user accounts.
- No streaming output.
- No RAG or document upload.
- No code execution sandbox.
- No multi-user data isolation.

These are intentional constraints for the first version.
