from functools import lru_cache
import os
from pathlib import Path

from pydantic import BaseModel


class Settings(BaseModel):
    deepseek_api_key: str | None = None
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"
    database_url: str = "sqlite:///./code_mentor.db"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]


def _read_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def _env_value(name: str, file_values: dict[str, str], default: str | None = None) -> str | None:
    return os.getenv(name) or file_values.get(name) or default


def build_settings(env_file: Path | None = None) -> Settings:
    # Read local .env first, then let real environment variables override it.
    file_values = _read_env_file(env_file or Path.cwd() / ".env")
    raw_origins = _env_value("CORS_ORIGINS", file_values)
    return Settings(
        deepseek_api_key=_env_value("DEEPSEEK_API_KEY", file_values),
        deepseek_base_url=_env_value("DEEPSEEK_BASE_URL", file_values, "https://api.deepseek.com")
        or "https://api.deepseek.com",
        deepseek_model=_env_value("DEEPSEEK_MODEL", file_values, "deepseek-v4-flash") or "deepseek-v4-flash",
        database_url=_env_value("DATABASE_URL", file_values, "sqlite:///./code_mentor.db") or "sqlite:///./code_mentor.db",
        cors_origins=raw_origins.split(",") if raw_origins else ["http://localhost:5173", "http://127.0.0.1:5173"],
    )


@lru_cache
def get_settings() -> Settings:
    return build_settings()
