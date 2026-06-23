from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.api.dependencies import get_llm_client
from app.db.database import get_session
from app.llm.generator import JSONGenerator
from app.schemas.interaction import AskRequest, LessonActionRequest, LessonInteractionResponse
from app.schemas.lesson import CreateLessonRequest, LessonListResponse, LessonResponse, UpdateLessonRequest
from app.services.lessons import LessonService

router = APIRouter(prefix="/lessons", tags=["lessons"])


def get_lesson_service(
    session: Session = Depends(get_session),
    llm_client=Depends(get_llm_client),
) -> LessonService:
    return LessonService(session, JSONGenerator(llm_client))


@router.post("", response_model=LessonResponse)
def create_lesson(
    request: CreateLessonRequest,
    service: LessonService = Depends(get_lesson_service),
) -> LessonResponse:
    return service.create_lesson(request)


@router.get("", response_model=LessonListResponse)
def list_lessons(
    limit: int = Query(default=20, ge=1, le=100),
    service: LessonService = Depends(get_lesson_service),
) -> LessonListResponse:
    return service.list_lessons(limit)


@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(
    lesson_id: str,
    service: LessonService = Depends(get_lesson_service),
) -> LessonResponse:
    return service.get_lesson(lesson_id)


@router.patch("/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    lesson_id: str,
    request: UpdateLessonRequest,
    service: LessonService = Depends(get_lesson_service),
) -> LessonResponse:
    return service.update_lesson(lesson_id, request)


@router.post("/{lesson_id}/actions", response_model=LessonInteractionResponse)
def lesson_action(
    lesson_id: str,
    request: LessonActionRequest,
    service: LessonService = Depends(get_lesson_service),
) -> LessonInteractionResponse:
    return service.perform_action(lesson_id, request)


@router.post("/{lesson_id}/ask", response_model=LessonInteractionResponse)
def ask_lesson(
    lesson_id: str,
    request: AskRequest,
    service: LessonService = Depends(get_lesson_service),
) -> LessonInteractionResponse:
    return service.ask(lesson_id, request)
