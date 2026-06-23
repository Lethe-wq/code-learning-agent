from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import InteractionType, LessonAction
from app.schemas.lesson import CodeExample


class AskRequest(BaseModel):
    question: str = Field(min_length=1)


class LessonActionRequest(BaseModel):
    action: LessonAction


class AskResponse(BaseModel):
    short_answer: str
    detailed_explanation: str
    code_example: CodeExample | None = None
    related_concepts: list[str]
    suggested_followups: list[str]


class ActionResponse(BaseModel):
    action: LessonAction
    title: str
    content: str
    code_example: CodeExample | None = None
    bullets: list[str]


class LessonInteractionResponse(BaseModel):
    id: str
    lesson_id: str
    type: InteractionType
    user_input: str
    response: AskResponse | ActionResponse
    created_at: datetime
