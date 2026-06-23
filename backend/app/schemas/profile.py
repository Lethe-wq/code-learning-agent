from pydantic import BaseModel


class LearningProfile(BaseModel):
    recent_topics: list[str]
    weak_points: list[str]
    favorite_topics: list[str]
    recommended_topics: list[str]
    preferred_explanation_style: str
