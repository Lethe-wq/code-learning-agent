import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.api.dependencies import get_llm_client
from app.db.database import get_session
from app.main import create_app


def lesson_generation_payload(title: str = "Python decorators") -> dict:
    return {
        "title": title,
        "content": {
            "one_liner": "Decorators wrap a function with another function.",
            "core_explanation": "A decorator receives a callable and returns a callable.",
            "code_examples": [
                {
                    "title": "Timing decorator",
                    "language": "python",
                    "code": "def deco(fn):\n    return fn",
                    "explanation": "The decorator returns a replacement callable.",
                }
            ],
            "prerequisites": ["functions", "closures"],
            "common_use_cases": ["logging", "authorization"],
            "misconceptions": ["Decorators do not run only at call time."],
            "comparisons": [
                {
                    "target_concept": "closure",
                    "similarities": ["Both can capture surrounding state."],
                    "differences": ["Decorators apply a wrapper to a callable."],
                    "when_to_use": "Use decorators for reusable call wrapping.",
                }
            ],
            "summary": ["Decorators transform callables."],
            "suggested_questions": ["How do decorator arguments work?"],
        },
    }


def ask_payload() -> dict:
    return {
        "short_answer": "Decorators and closures both depend on functions as values.",
        "detailed_explanation": "A decorator often returns a closure that remembers the original function.",
        "code_example": None,
        "related_concepts": ["closures", "higher-order functions"],
        "suggested_followups": ["Can decorators accept arguments?"],
    }


def action_payload() -> dict:
    return {
        "title": "Decorator example",
        "content": "A decorator can add logging around a function call.",
        "code_example": {
            "title": "Logging wrapper",
            "language": "python",
            "code": "def log(fn):\n    return fn",
            "explanation": "The wrapper would add behavior before delegating.",
        },
        "bullets": ["Wrap the original function", "Return the wrapper"],
    }


class FakeLLMClient:
    def __init__(self) -> None:
        self.responses: list[str] = []
        self.calls: list[list[dict[str, str]]] = []

    def queue_json(self, payload: dict) -> None:
        import json

        self.responses.append(json.dumps(payload))

    def queue_text(self, payload: str) -> None:
        self.responses.append(payload)

    def complete_json(self, messages: list[dict[str, str]]) -> str:
        self.calls.append(messages)
        if not self.responses:
            raise AssertionError("FakeLLMClient response queue is empty")
        return self.responses.pop(0)


@pytest.fixture()
def fake_llm() -> FakeLLMClient:
    return FakeLLMClient()


@pytest.fixture()
def client(fake_llm: FakeLLMClient) -> TestClient:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def session_override():
        with Session(engine) as session:
            yield session

    app = create_app(init_database=False)
    app.dependency_overrides[get_session] = session_override
    app.dependency_overrides[get_llm_client] = lambda: fake_llm

    with TestClient(app) as test_client:
        yield test_client
