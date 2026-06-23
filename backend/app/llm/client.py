from typing import Any

import httpx

from app.config import Settings, get_settings


class LLMClient:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def complete_json(self, messages: list[dict[str, str]]) -> str:
        if not self.settings.deepseek_api_key:
            raise RuntimeError("DEEPSEEK_API_KEY is required for real LLM calls")

        url = self.settings.deepseek_base_url.rstrip("/") + "/chat/completions"
        payload: dict[str, Any] = {
            "model": self.settings.deepseek_model,
            "messages": messages,
            "stream": False,
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }
        headers = {"Authorization": f"Bearer {self.settings.deepseek_api_key}"}

        with httpx.Client(timeout=60) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        return data["choices"][0]["message"]["content"]
