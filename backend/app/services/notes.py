from datetime import datetime, timezone

from sqlmodel import Session, desc, select

from app.api.errors import APIError
from app.models.tables import Lesson, Note
from app.schemas.note import CreateNoteRequest, NoteListResponse, NoteResponse
from app.services.ids import prefixed_id


class NoteService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_note(self, request: CreateNoteRequest) -> NoteResponse:
        if self.session.get(Lesson, request.lesson_id) is None:
            raise APIError("LESSON_NOT_FOUND", "Lesson not found", status_code=404)

        note = Note(
            id=prefixed_id("note"),
            lesson_id=request.lesson_id,
            content=request.content,
        )
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return self._note_response(note)

    def list_notes(self, lesson_id: str) -> NoteListResponse:
        notes = self.session.exec(
            select(Note).where(Note.lesson_id == lesson_id).order_by(desc(Note.created_at))
        ).all()
        return NoteListResponse(items=[self._note_response(note) for note in notes])

    def update_note_timestamp(self, note: Note) -> None:
        note.updated_at = datetime.now(timezone.utc)

    def _note_response(self, note: Note) -> NoteResponse:
        return NoteResponse(
            id=note.id,
            lesson_id=note.lesson_id,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
