from app.config import build_settings


def test_build_settings_reads_deepseek_values_from_env_file(tmp_path, monkeypatch):
    monkeypatch.delenv("DEEPSEEK_API_KEY", raising=False)
    monkeypatch.delenv("DEEPSEEK_BASE_URL", raising=False)
    monkeypatch.delenv("DEEPSEEK_MODEL", raising=False)
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "DEEPSEEK_API_KEY=file-key",
                "DEEPSEEK_BASE_URL=https://example.deepseek.test",
                "DEEPSEEK_MODEL=file-model",
            ]
        ),
        encoding="utf-8",
    )

    settings = build_settings(env_file=env_file)

    assert settings.deepseek_api_key == "file-key"
    assert settings.deepseek_base_url == "https://example.deepseek.test"
    assert settings.deepseek_model == "file-model"


def test_environment_variables_override_env_file(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text("DEEPSEEK_MODEL=file-model", encoding="utf-8")
    monkeypatch.setenv("DEEPSEEK_MODEL", "env-model")

    settings = build_settings(env_file=env_file)

    assert settings.deepseek_model == "env-model"
