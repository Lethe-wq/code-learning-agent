from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.database import get_session
from app.schemas.note import CreateNoteRequest, NoteListResponse, NoteResponse
from app.services.notes import NoteService

router = APIRouter(prefix="/notes", tags=["notes"])


def get_note_service(session: Session = Depends(get_session)) -> NoteService:
    return NoteService(session)


@router.post("", response_model=NoteResponse)
def create_note(
    request: CreateNoteRequest,
    service: NoteService = Depends(get_note_service),
) -> NoteResponse:
    return service.create_note(request)


@router.get("", response_model=NoteListResponse)
def list_notes(
    lesson_id: str = Query(min_length=1),
    service: NoteService = Depends(get_note_service),
) -> NoteListResponse:
    return service.list_notes(lesson_id)
