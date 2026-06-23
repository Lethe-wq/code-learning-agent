from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import Category, Difficulty, ReviewStatus


class CodeExample(BaseModel):
    title: str
    language: str
    code: str
    explanation: str


class ConceptComparison(BaseModel):
    target_concept: str
    similarities: list[str]
    differences: list[str]
    when_to_use: str


class LessonContent(BaseModel):
    one_liner: str
    core_explanation: str
    code_examples: list[CodeExample]
    prerequisites: list[str]
    common_use_cases: list[str]
    misconceptions: list[str]
    comparisons: list[ConceptComparison]
    summary: list[str]
    suggested_questions: list[str]


class CreateLessonRequest(BaseModel):
    prompt: str = Field(min_length=1)
    category: Category
    difficulty: Difficulty


class UpdateLessonRequest(BaseModel):
    is_favorite: bool | None = None
    review_status: ReviewStatus | None = None


class LessonResponse(BaseModel):
    id: str
    title: str
    category: Category
    difficulty: Difficulty
    user_prompt: str
    content: LessonContent
    is_favorite: bool
    review_status: ReviewStatus
    created_at: datetime
    updated_at: datetime


class LessonListResponse(BaseModel):
    items: list[LessonResponse]
