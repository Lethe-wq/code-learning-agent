from datetime import datetime, timezone
from typing import Any

from sqlalchemy import or_
from sqlmodel import Session, desc, select

from app.api.errors import APIError
from app.llm.context import ContextBuilder
from app.llm.generator import JSONGenerator, LLMGenerationError
from app.llm.prompts import PromptBuilder
from app.models.tables import Lesson, LessonInteraction
from app.schemas.interaction import (
    ActionResponse,
    AskRequest,
    LessonActionRequest,
    LessonInteractionResponse,
)
from app.schemas.common import Category, ReviewStatus
from app.schemas.lesson import CreateLessonRequest, LessonListResponse, LessonResponse, UpdateLessonRequest
from app.schemas.llm import ActionGeneration, AskGeneration, LessonGeneration
from app.services.ids import prefixed_id


class LessonService:
    def __init__(self, session: Session, generator: JSONGenerator) -> None:
        self.session = session
        self.generator = generator
        self.prompts = PromptBuilder()

    def create_lesson(self, request: CreateLessonRequest) -> LessonResponse:
        generation = self._generate(
            self.prompts.lesson_messages(
                prompt=request.prompt,
                category=request.category,
                difficulty=request.difficulty,
            ),
            LessonGeneration,
        )
        lesson = Lesson(
            id=prefixed_id("lesson"),
            title=generation.title,
            category=request.category,
            difficulty=request.difficulty,
            user_prompt=request.prompt,
            content=generation.content.model_dump(),
        )
        self.session.add(lesson)
        self.session.commit()
        self.session.refresh(lesson)
        return self._lesson_response(lesson)

    def get_lesson(self, lesson_id: str) -> LessonResponse:
        return self._lesson_response(self._get_lesson_model(lesson_id))

    def list_lessons(
        self,
        limit: int = 20,
        *,
        offset: int = 0,
        query: str | None = None,
        category: Category | None = None,
        review_status: ReviewStatus | None = None,
        is_favorite: bool | None = None,
    ) -> LessonListResponse:
        statement = select(Lesson)
        if query and query.strip():
            search = f"%{query.strip()}%"
            statement = statement.where(or_(Lesson.title.ilike(search), Lesson.user_prompt.ilike(search)))
        if category:
            statement = statement.where(Lesson.category == category)
        if review_status:
            statement = statement.where(Lesson.review_status == review_status)
        if is_favorite is not None:
            statement = statement.where(Lesson.is_favorite == is_favorite)
        lessons = self.session.exec(
            statement.order_by(desc(Lesson.created_at)).offset(offset).limit(limit)
        ).all()
        return LessonListResponse(items=[self._lesson_response(lesson) for lesson in lessons])

    def update_lesson(self, lesson_id: str, request: UpdateLessonRequest) -> LessonResponse:
        lesson = self._get_lesson_model(lesson_id)
        if request.is_favorite is not None:
            lesson.is_favorite = request.is_favorite
        if request.review_status is not None:
            lesson.review_status = request.review_status
        lesson.updated_at = datetime.now(timezone.utc)
        self.session.add(lesson)
        self.session.commit()
        self.session.refresh(lesson)
        return self._lesson_response(lesson)

    def perform_action(self, lesson_id: str, request: LessonActionRequest) -> LessonInteractionResponse:
        lesson = self._get_lesson_model(lesson_id)
        context = ContextBuilder(self.session).for_action(lesson, request.action)
        generation = self._generate(self.prompts.action_messages(context), ActionGeneration)
        response = ActionResponse(action=request.action, **generation.model_dump())
        interaction = self._store_interaction(
            lesson_id=lesson.id,
            interaction_type=request.action,
            user_input=request.action,
            response=response.model_dump(),
        )
        return self._interaction_response(interaction)

    def ask(self, lesson_id: str, request: AskRequest) -> LessonInteractionResponse:
        lesson = self._get_lesson_model(lesson_id)
        context = ContextBuilder(self.session).for_ask(lesson, request.question)
        response = self._generate(self.prompts.ask_messages(context), AskGeneration)
        interaction = self._store_interaction(
            lesson_id=lesson.id,
            interaction_type="ask",
            user_input=request.question,
            response=response.model_dump(),
        )
        return self._interaction_response(interaction)

    def _generate(self, messages: list[dict[str, str]], schema: type) -> Any:
        try:
            return self.generator.generate(messages, schema)
        except LLMGenerationError as exc:
            raise APIError("LLM_GENERATION_FAILED", "LLM generation failed", status_code=502) from exc

    def _get_lesson_model(self, lesson_id: str) -> Lesson:
        lesson = self.session.get(Lesson, lesson_id)
        if lesson is None:
            raise APIError("LESSON_NOT_FOUND", "Lesson not found", status_code=404)
        return lesson

    def _store_interaction(
        self,
        *,
        lesson_id: str,
        interaction_type: str,
        user_input: str,
        response: dict[str, Any],
    ) -> LessonInteraction:
        interaction = LessonInteraction(
            id=prefixed_id("interaction"),
            lesson_id=lesson_id,
            type=interaction_type,
            user_input=user_input,
            response=response,
        )
        self.session.add(interaction)
        self.session.commit()
        self.session.refresh(interaction)
        return interaction

    def _lesson_response(self, lesson: Lesson) -> LessonResponse:
        return LessonResponse(
            id=lesson.id,
            title=lesson.title,
            category=lesson.category,
            difficulty=lesson.difficulty,
            user_prompt=lesson.user_prompt,
            content=lesson.content,
            is_favorite=lesson.is_favorite,
            review_status=lesson.review_status,
            created_at=lesson.created_at,
            updated_at=lesson.updated_at,
        )

    def _interaction_response(self, interaction: LessonInteraction) -> LessonInteractionResponse:
        return LessonInteractionResponse(
            id=interaction.id,
            lesson_id=interaction.lesson_id,
            type=interaction.type,
            user_input=interaction.user_input,
            response=interaction.response,
            created_at=interaction.created_at,
        )
