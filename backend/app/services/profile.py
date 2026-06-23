from sqlmodel import Session, desc, select

from app.models.tables import Lesson, WeakPoint
from app.schemas.profile import LearningProfile


class ProfileService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_profile(self) -> LearningProfile:
        recent_lessons = self.session.exec(
            select(Lesson).order_by(desc(Lesson.created_at)).limit(5)
        ).all()
        favorite_lessons = self.session.exec(
            select(Lesson).where(Lesson.is_favorite == True).order_by(desc(Lesson.updated_at)).limit(5)  # noqa: E712
        ).all()
        weak_points = self.session.exec(
            select(WeakPoint).order_by(desc(WeakPoint.created_at)).limit(5)
        ).all()

        recent_topics = [lesson.title for lesson in recent_lessons]
        return LearningProfile(
            recent_topics=recent_topics,
            weak_points=[weak_point.topic for weak_point in weak_points],
            favorite_topics=[lesson.title for lesson in favorite_lessons],
            recommended_topics=[f"Review {topic}" for topic in recent_topics[:3]],
            preferred_explanation_style="concise, example-driven",
        )
