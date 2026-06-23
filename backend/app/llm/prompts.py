import json
from typing import Any


class PromptBuilder:
    latex_rule = (
        "When math formulas, derivations, or symbolic definitions are useful, prefer LaTeX. "
        "Use $...$ for inline formulas and $$...$$ for standalone formulas. "
        "Do not use images, HTML, or Markdown tables to fake formulas."
    )

    def lesson_messages(self, *, prompt: str, category: str, difficulty: str) -> list[dict[str, str]]:
        # All prompt assembly is centralized here so services never handcraft LLM instructions.
        schema = {
            "title": "string",
            "content": {
                "one_liner": "string",
                "core_explanation": "string",
                "code_examples": [
                    {
                        "title": "string",
                        "language": "string",
                        "code": "string",
                        "explanation": "string",
                    }
                ],
                "prerequisites": ["string"],
                "common_use_cases": ["string"],
                "misconceptions": ["string"],
                "comparisons": [
                    {
                        "target_concept": "string",
                        "similarities": ["string"],
                        "differences": ["string"],
                        "when_to_use": "string",
                    }
                ],
                "summary": ["string"],
                "suggested_questions": ["string"],
            },
        }
        return [
            {
                "role": "system",
                "content": (
                    "You are Code Mentor, a code knowledge explanation tutor for intermediate learners. "
                    "Return only structured JSON. Do not return Markdown. Do not wrap JSON in code fences. "
                    "The lesson must answer the user's exact prompt and must not switch topics. "
                    "The content must be a JSON object, not a string. "
                    "Use Chinese by default unless the user clearly asks in another language. "
                    f"{self.latex_rule} "
                    "Focus on explanation, examples, comparisons, misconceptions, and review points; "
                    "do not create a quiz-heavy lesson."
                ),
            },
            {
                "role": "system",
                "content": (
                    "Return JSON that matches this exact schema. Include every field. "
                    "Use empty arrays only when a field truly has no items: "
                    + json.dumps(schema, ensure_ascii=False)
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "task": "create_lesson",
                        "prompt": prompt,
                        "category": category,
                        "difficulty": difficulty,
                    }
                ),
            },
        ]

    def action_messages(self, context: dict[str, Any]) -> list[dict[str, str]]:
        schema = {
            "title": "string",
            "content": "string",
            "code_example": {
                "title": "string",
                "language": "string",
                "code": "string",
                "explanation": "string",
            },
            "bullets": ["string"],
        }
        return [
            {
                "role": "system",
                "content": (
                    "Return only ActionResponse JSON without the action field. "
                    "Do not return Markdown. Do not wrap JSON in code fences. "
                    "Answer using the current lesson context and recent interactions only. "
                    "Use Chinese by default unless the user clearly asks in another language. "
                    f"{self.latex_rule} "
                    "Return JSON that matches this exact schema: "
                    + json.dumps(schema, ensure_ascii=False)
                ),
            },
            {"role": "user", "content": json.dumps(context, default=str)},
        ]

    def ask_messages(self, context: dict[str, Any]) -> list[dict[str, str]]:
        schema = {
            "short_answer": "string",
            "detailed_explanation": "string",
            "code_example": {
                "title": "string",
                "language": "string",
                "code": "string",
                "explanation": "string",
            },
            "related_concepts": ["string"],
            "suggested_followups": ["string"],
        }
        return [
            {
                "role": "system",
                "content": (
                    "Return only AskResponse JSON for the user's follow-up question. "
                    "Do not return Markdown. Do not wrap JSON in code fences. "
                    "Answer using the current lesson context, recent interactions, and lightweight profile only. "
                    "Use Chinese by default unless the user clearly asks in another language. "
                    f"{self.latex_rule} "
                    "Return JSON that matches this exact schema: "
                    + json.dumps(schema, ensure_ascii=False)
                ),
            },
            {"role": "user", "content": json.dumps(context, default=str)},
        ]
