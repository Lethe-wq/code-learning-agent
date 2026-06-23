import json
from json import JSONDecodeError
from typing import Protocol, TypeVar

from pydantic import BaseModel, ValidationError


class JSONLLMClient(Protocol):
    def complete_json(self, messages: list[dict[str, str]]) -> str:
        ...


class LLMGenerationError(RuntimeError):
    pass


TModel = TypeVar("TModel", bound=BaseModel)


class JSONGenerator:
    def __init__(self, client: JSONLLMClient) -> None:
        self.client = client

    def generate(self, messages: list[dict[str, str]], schema: type[TModel]) -> TModel:
        last_error: Exception | None = None
        for _attempt in range(2):
            raw = self.client.complete_json(messages)
            try:
                parsed = json.loads(raw)
                # This is the validation boundary for all model-generated structured output.
                return schema.model_validate(parsed)
            except (JSONDecodeError, ValidationError) as exc:
                # Retry once because JSON mode can still produce malformed or schema-invalid output.
                last_error = exc

        raise LLMGenerationError(f"LLM did not return valid JSON matching {schema.__name__}") from last_error
