from datetime import datetime

from pydantic import BaseModel, Field


class CreateNoteRequest(BaseModel):
    lesson_id: str = Field(min_length=1)
    content: str = Field(min_length=1)


class UpdateNoteRequest(BaseModel):
    content: str = Field(min_length=1)


class NoteResponse(BaseModel):
    id: str
    lesson_id: str
    lesson_title: str | None = None
    content: str
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    items: list[NoteResponse]
