from sqlmodel import Session

from app.llm.context import ContextBuilder
from app.llm.prompts import PromptBuilder
from app.models.tables import Lesson, LessonInteraction
from tests.conftest import action_payload, ask_payload, lesson_generation_payload


def test_prompt_builder_centralizes_lesson_and_action_messages():
    builder = PromptBuilder()

    lesson_messages = builder.lesson_messages(
        prompt="Explain decorators",
        category="python",
        difficulty="intermediate",
    )
    lesson_prompt = "\n".join(message["content"] for message in lesson_messages)
    assert lesson_messages[0]["role"] == "system"
    assert "structured JSON" in lesson_messages[0]["content"]
    assert "Explain decorators" in lesson_prompt
    assert "content must be a JSON object" in lesson_prompt
    assert "one_liner" in lesson_prompt
    assert "core_explanation" in lesson_prompt
    assert "code_examples" in lesson_prompt
    assert "suggested_questions" in lesson_prompt
    assert "$...$" in lesson_prompt
    assert "$$...$$" in lesson_prompt

    action_messages = builder.action_messages({"action": "example", "lesson": {"title": "Decorators"}})
    action_prompt = "\n".join(message["content"] for message in action_messages)
    assert action_messages[0]["role"] == "system"
    assert "ActionResponse JSON" in action_messages[0]["content"]
    assert "title" in action_prompt
    assert "bullets" in action_prompt
    assert "$...$" in action_prompt
    assert "Decorators" in action_messages[1]["content"]

    ask_messages = builder.ask_messages({"question": "Why is $f(x)=x^2$ useful?", "lesson": {"title": "Functions"}})
    ask_prompt = "\n".join(message["content"] for message in ask_messages)
    assert ask_messages[0]["role"] == "system"
    assert "AskResponse JSON" in ask_messages[0]["content"]
    assert "short_answer" in ask_prompt
    assert "suggested_followups" in ask_prompt
    assert "$$...$$" in ask_prompt


def test_context_builder_includes_lesson_recent_interactions_and_profile(client):
    from app.db.database import get_session

    session: Session = next(client.app.dependency_overrides[get_session]())
    generated = lesson_generation_payload("Decorators")
    lesson = Lesson(
        id="lesson_context",
        title="Decorators",
        category="python",
        difficulty="intermediate",
        user_prompt="Explain decorators",
        content=generated["content"],
    )
    session.add(lesson)
    for index in range(6):
        session.add(
            LessonInteraction(
                id=f"interaction_{index}",
                lesson_id=lesson.id,
                type="ask",
                user_input=f"question {index}",
                response=ask_payload(),
            )
        )
    session.commit()

    context = ContextBuilder(session).for_ask(lesson, "How are decorators closures?")

    assert context["lesson"]["title"] == "Decorators"
    assert context["current"]["question"] == "How are decorators closures?"
    assert len(context["recent_interactions"]) == 5
    assert context["recent_interactions"][0]["user_input"] == "question 5"
    assert context["profile"]["recent_topics"] == ["Decorators"]
