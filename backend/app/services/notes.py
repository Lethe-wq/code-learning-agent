from datetime import datetime, timezone

from sqlmodel import Session, desc, select

from app.api.errors import APIError
from app.models.tables import Lesson, Note
from app.schemas.note import CreateNoteRequest, NoteListResponse, NoteResponse, UpdateNoteRequest
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

    def list_notes(self, lesson_id: str | None, *, limit: int = 100, query: str | None = None) -> NoteListResponse:
        statement = select(Note)
        if lesson_id:
            statement = statement.where(Note.lesson_id == lesson_id)
        if query and query.strip():
            statement = statement.where(Note.content.ilike(f"%{query.strip()}%"))
        notes = self.session.exec(statement.order_by(desc(Note.created_at)).limit(limit)).all()
        return NoteListResponse(items=[self._note_response(note) for note in notes])

    def update_note(self, note_id: str, request: UpdateNoteRequest) -> NoteResponse:
        note = self.session.get(Note, note_id)
        if note is None:
            raise APIError("NOTE_NOT_FOUND", "Note not found", status_code=404)
        note.content = request.content
        note.updated_at = datetime.now(timezone.utc)
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return self._note_response(note)

    def delete_note(self, note_id: str) -> None:
        note = self.session.get(Note, note_id)
        if note is None:
            raise APIError("NOTE_NOT_FOUND", "Note not found", status_code=404)
        self.session.delete(note)
        self.session.commit()

    def _note_response(self, note: Note) -> NoteResponse:
        lesson = self.session.get(Lesson, note.lesson_id)
        return NoteResponse(
            id=note.id,
            lesson_id=note.lesson_id,
            lesson_title=lesson.title if lesson else None,
            content=note.content,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
