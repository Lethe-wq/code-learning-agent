from typing import Literal

from pydantic import BaseModel


Category = Literal["python", "cpp", "sql", "algorithm", "general"]
Difficulty = Literal["beginner", "intermediate", "advanced"]
ReviewStatus = Literal["none", "need_review", "reviewed"]
LessonAction = Literal["rephrase", "example", "compare", "review"]
InteractionType = Literal["ask", "rephrase", "example", "compare", "review"]


class APIErrorBody(BaseModel):
    code: str
    message: str


class APIErrorResponse(BaseModel):
    error: APIErrorBody
