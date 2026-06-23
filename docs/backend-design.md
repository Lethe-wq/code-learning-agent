# Code Mentor Backend Design

## Architecture

The backend is a local single-user FastAPI service. It stores lessons, interactions, notes, and weak points in SQLite.

The backend must keep routers thin. Business logic belongs in services. LLM calls and prompt assembly must be centralized in the `llm/` package.

## Module Boundaries

- `api/`: FastAPI routers and dependency wiring.
- `models/`: SQLModel tables.
- `schemas/`: Pydantic request/response schemas. These mirror `docs/api-contract.md`.
- `services/`: lesson, note, and profile application logic.
- `llm/`: DeepSeek client, prompt building, context building, validation, and retry handling.
- `db/`: SQLite engine, session dependency, and initialization.
- `tests/`: pytest coverage for API, services, prompt building, and retry behavior.

## LLM Design

`LLMClient` is the only place that calls DeepSeek. Services must not call DeepSeek directly.

Configuration:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`, default `https://api.deepseek.com`
- `DEEPSEEK_MODEL`, default `deepseek-v4-flash`

MVP behavior:

- `stream=false`
- `temperature=0.3`
- JSON mode enabled with `response_format={"type":"json_object"}`
- Retry once when JSON parsing or schema validation fails.

Tests must use a fake LLM client and must not require a real API key.

## Prompt Assembly

`PromptBuilder` builds messages for creating lessons and for actions.

`ContextBuilder` gathers runtime context:

1. Current lesson content.
2. Most recent five interactions for that lesson.
3. Lightweight learning profile.
4. Current question or action.

The context builder is the future extension point for RAG. Do not implement RAG in MVP.

## Persistence

The database stores JSON content in JSON/text columns depending on SQLModel compatibility. The API response must always expose structured JSON objects, never raw JSON strings.

MVP tables:

- `lessons`
- `lesson_interactions`
- `notes`
- `weak_points`

No `user_id` is required in MVP.

## Maintainability Rules

- Add comments only for non-obvious design intent: prompt assembly, retry behavior, validation boundaries, and future streaming/RAG hooks.
- Keep public schemas explicit and stable.
- Keep database models separate from API schemas.
- Keep frontend-facing fields aligned with `docs/api-contract.md`.

