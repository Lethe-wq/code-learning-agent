from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import APIError, api_error_handler, validation_error_handler
from app.api.lessons import router as lessons_router
from app.api.notes import router as notes_router
from app.api.profile import router as profile_router
from app.config import get_settings
from app.db.database import init_db


def create_app(*, init_database: bool = True) -> FastAPI:
    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        # Future streaming hooks should be wired at app startup alongside the LLM client.
        if init_database:
            init_db()
        yield

    app = FastAPI(title="Code Mentor API", lifespan=lifespan)
    settings = get_settings()
    # Keep browser integration local-first for the MVP while allowing env overrides for future deployments.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_exception_handler(APIError, api_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.include_router(lessons_router, prefix="/api")
    app.include_router(notes_router, prefix="/api")
    app.include_router(profile_router, prefix="/api")

    return app


app = create_app()
