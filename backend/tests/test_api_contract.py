from tests.conftest import action_payload, ask_payload, lesson_generation_payload


def test_lesson_lifecycle_exposes_contract_shape(client, fake_llm):
    fake_llm.queue_json(lesson_generation_payload())

    created = client.post(
        "/api/lessons",
        json={
            "prompt": "Explain Python decorators and compare them with closures",
            "category": "python",
            "difficulty": "intermediate",
        },
    )

    assert created.status_code == 200
    lesson = created.json()
    assert lesson["id"].startswith("lesson_")
    assert lesson["title"] == "Python decorators"
    assert lesson["category"] == "python"
    assert lesson["difficulty"] == "intermediate"
    assert lesson["user_prompt"] == "Explain Python decorators and compare them with closures"
    assert lesson["content"]["code_examples"][0]["language"] == "python"
    assert lesson["is_favorite"] is False
    assert lesson["review_status"] == "none"
    assert "created_at" in lesson
    assert "updated_at" in lesson

    fetched = client.get(f"/api/lessons/{lesson['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["content"]["summary"] == ["Decorators transform callables."]

    listed = client.get("/api/lessons?limit=20")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()["items"]] == [lesson["id"]]

    updated = client.patch(
        f"/api/lessons/{lesson['id']}",
        json={"is_favorite": True, "review_status": "need_review"},
    )
    assert updated.status_code == 200
    assert updated.json()["is_favorite"] is True
    assert updated.json()["review_status"] == "need_review"


def test_actions_ask_notes_and_profile_use_expected_shapes(client, fake_llm):
    fake_llm.queue_json(lesson_generation_payload("SQL joins"))
    lesson = client.post(
        "/api/lessons",
        json={"prompt": "Explain joins", "category": "sql", "difficulty": "beginner"},
    ).json()

    fake_llm.queue_json(action_payload())
    action = client.post(f"/api/lessons/{lesson['id']}/actions", json={"action": "example"})
    assert action.status_code == 200
    action_body = action.json()
    assert action_body["id"].startswith("interaction_")
    assert action_body["lesson_id"] == lesson["id"]
    assert action_body["type"] == "example"
    assert action_body["user_input"] == "example"
    assert action_body["response"]["action"] == "example"
    assert action_body["response"]["bullets"] == ["Wrap the original function", "Return the wrapper"]

    fake_llm.queue_json(ask_payload())
    asked = client.post(f"/api/lessons/{lesson['id']}/ask", json={"question": "Why do joins duplicate rows?"})
    assert asked.status_code == 200
    ask_body = asked.json()
    assert ask_body["type"] == "ask"
    assert ask_body["user_input"] == "Why do joins duplicate rows?"
    assert ask_body["response"]["related_concepts"] == ["closures", "higher-order functions"]

    note = client.post("/api/notes", json={"lesson_id": lesson["id"], "content": "Review joins later."})
    assert note.status_code == 200
    assert note.json()["id"].startswith("note_")
    assert note.json()["content"] == "Review joins later."

    notes = client.get(f"/api/notes?lesson_id={lesson['id']}")
    assert notes.status_code == 200
    assert [item["id"] for item in notes.json()["items"]] == [note.json()["id"]]

    profile = client.get("/api/profile")
    assert profile.status_code == 200
    assert profile.json() == {
        "recent_topics": ["SQL joins"],
        "weak_points": [],
        "favorite_topics": [],
        "recommended_topics": ["Review SQL joins"],
        "preferred_explanation_style": "concise, example-driven",
    }


def test_expected_errors_use_contract_shape(client):
    missing = client.get("/api/lessons/lesson_missing")

    assert missing.status_code == 404
    assert missing.json() == {
        "error": {
            "code": "LESSON_NOT_FOUND",
            "message": "Lesson not found",
        }
    }


def test_lesson_filters_and_note_crud_use_expected_shapes(client, fake_llm):
    fake_llm.queue_json(lesson_generation_payload("Python decorators"))
    first = client.post(
        "/api/lessons",
        json={"prompt": "Explain decorators", "category": "python", "difficulty": "intermediate"},
    ).json()
    fake_llm.queue_json(lesson_generation_payload("SQL joins"))
    second = client.post(
        "/api/lessons",
        json={"prompt": "Explain joins", "category": "sql", "difficulty": "beginner"},
    ).json()

    client.patch(f"/api/lessons/{first['id']}", json={"is_favorite": True})

    filtered = client.get("/api/lessons?q=decorators&is_favorite=true")
    assert filtered.status_code == 200
    assert [item["id"] for item in filtered.json()["items"]] == [first["id"]]

    note = client.post("/api/notes", json={"lesson_id": second["id"], "content": "Review joins."}).json()
    assert note["lesson_title"] == "SQL joins"

    all_notes = client.get("/api/notes")
    assert [item["id"] for item in all_notes.json()["items"]] == [note["id"]]

    updated = client.patch(f"/api/notes/{note['id']}", json={"content": "Review join cardinality."})
    assert updated.status_code == 200
    assert updated.json()["content"] == "Review join cardinality."

    deleted = client.delete(f"/api/notes/{note['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/notes").json()["items"] == []

    missing_note = client.delete(f"/api/notes/{note['id']}")
    assert missing_note.status_code == 404
    assert missing_note.json()["error"]["code"] == "NOTE_NOT_FOUND"
