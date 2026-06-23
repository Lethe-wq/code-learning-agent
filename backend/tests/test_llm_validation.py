from app.llm.generator import JSONGenerator, LLMGenerationError
from app.llm.prompts import PromptBuilder
from app.schemas.llm import LessonGeneration
from tests.conftest import FakeLLMClient, lesson_generation_payload


def test_json_generator_retries_once_after_invalid_json():
    client = FakeLLMClient()
    client.queue_text("{not json")
    client.queue_json(lesson_generation_payload())
    generator = JSONGenerator(client)

    result = generator.generate(
        PromptBuilder().lesson_messages(
            prompt="Explain decorators",
            category="python",
            difficulty="intermediate",
        ),
        LessonGeneration,
    )

    assert result.title == "Python decorators"
    assert len(client.calls) == 2


def test_json_generator_raises_after_second_schema_failure():
    client = FakeLLMClient()
    client.queue_json({"title": "Missing content"})
    client.queue_json({"title": "Still missing content"})
    generator = JSONGenerator(client)

    try:
        generator.generate([{"role": "user", "content": "create"}], LessonGeneration)
    except LLMGenerationError as exc:
        assert "valid JSON matching LessonGeneration" in str(exc)
    else:
        raise AssertionError("Expected LLMGenerationError")
