from functools import lru_cache

from app.llm.client import LLMClient


@lru_cache
def get_llm_client() -> LLMClient:
    return LLMClient()
