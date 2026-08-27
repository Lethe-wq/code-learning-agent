from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.database import get_session
from app.schemas.note import CreateNoteRequest, NoteListResponse, NoteResponse, UpdateNoteRequest
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
    lesson_id: str | None = Query(default=None, min_length=1),
    limit: int = Query(default=100, ge=1, le=100),
    q: str | None = Query(default=None, max_length=200),
    service: NoteService = Depends(get_note_service),
) -> NoteListResponse:
    return service.list_notes(lesson_id, limit=limit, query=q)


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    request: UpdateNoteRequest,
    service: NoteService = Depends(get_note_service),
) -> NoteResponse:
    return service.update_note(note_id, request)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: str, service: NoteService = Depends(get_note_service)) -> None:
    service.delete_note(note_id)
