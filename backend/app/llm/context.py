from typing import Any

from sqlmodel import Session, desc, select

from app.models.tables import Lesson, LessonInteraction
from app.services.profile import ProfileService


class ContextBuilder:
    def __init__(self, session: Session) -> None:
        self.session = session

    def for_action(self, lesson: Lesson, action: str) -> dict[str, Any]:
        return self._base_context(lesson) | {"current": {"action": action}}

    def for_ask(self, lesson: Lesson, question: str) -> dict[str, Any]:
        return self._base_context(lesson) | {"current": {"question": question}}

    def _base_context(self, lesson: Lesson) -> dict[str, Any]:
        interactions = self.session.exec(
            select(LessonInteraction)
            .where(LessonInteraction.lesson_id == lesson.id)
            .order_by(desc(LessonInteraction.created_at), desc(LessonInteraction.id))
            .limit(5)
        ).all()

        # This is the future RAG extension point; MVP context stays lightweight and local.
        return {
            "lesson": self._lesson_context(lesson),
            "recent_interactions": [self._interaction_context(interaction) for interaction in interactions],
            "profile": ProfileService(self.session).get_profile().model_dump(),
        }

    def _lesson_context(self, lesson: Lesson) -> dict[str, Any]:
        return {
            "id": lesson.id,
            "title": lesson.title,
            "category": lesson.category,
            "difficulty": lesson.difficulty,
            "user_prompt": lesson.user_prompt,
            "content": lesson.content,
        }

    def _interaction_context(self, interaction: LessonInteraction) -> dict[str, Any]:
        return {
            "id": interaction.id,
            "type": interaction.type,
            "user_input": interaction.user_input,
            "response": interaction.response,
            "created_at": interaction.created_at,
        }
