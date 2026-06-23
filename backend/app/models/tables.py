from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Lesson(SQLModel, table=True):
    __tablename__ = "lessons"

    id: str = Field(primary_key=True)
    title: str
    category: str
    difficulty: str
    user_prompt: str
    content: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    is_favorite: bool = False
    review_status: str = "none"
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class LessonInteraction(SQLModel, table=True):
    __tablename__ = "lesson_interactions"

    id: str = Field(primary_key=True)
    lesson_id: str = Field(index=True, foreign_key="lessons.id")
    type: str
    user_input: str
    response: dict[str, Any] = Field(sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=utc_now)


class Note(SQLModel, table=True):
    __tablename__ = "notes"

    id: str = Field(primary_key=True)
    lesson_id: str = Field(index=True, foreign_key="lessons.id")
    content: str
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class WeakPoint(SQLModel, table=True):
    __tablename__ = "weak_points"

    id: str = Field(primary_key=True)
    topic: str = Field(index=True)
    created_at: datetime = Field(default_factory=utc_now)
