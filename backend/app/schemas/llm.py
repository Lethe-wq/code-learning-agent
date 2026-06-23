from pydantic import BaseModel

from app.schemas.interaction import AskResponse
from app.schemas.lesson import CodeExample, LessonContent


class LessonGeneration(BaseModel):
    title: str
    content: LessonContent


class ActionGeneration(BaseModel):
    title: str
    content: str
    code_example: CodeExample | None = None
    bullets: list[str]


class AskGeneration(AskResponse):
    pass
