from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.database import get_session
from app.schemas.profile import LearningProfile
from app.services.profile import ProfileService

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=LearningProfile)
def get_profile(session: Session = Depends(get_session)) -> LearningProfile:
    return ProfileService(session).get_profile()
