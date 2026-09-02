"""Groq vision — extract homework questions from uploaded images."""

from __future__ import annotations

import json
import re
from functools import lru_cache

from groq import Groq

from intellecta.config import Settings, get_settings
from intellecta.orchestration.subjects import (
    ALLOWED_SUBJECT_VALUES,
    SUBJECT_SCOPE_DESCRIPTION,
    format_allowed_subjects_list,
    is_allowed_subject,
    subject_label,
)

ANALYSIS_PROMPT = f"""You analyze homework or study images for IntellectA, a tutor that ONLY supports these subjects:
{format_allowed_subjects_list()}

{SUBJECT_SCOPE_DESCRIPTION}

Read the image carefully. Extract any question, equation, or problem text visible in the image.

Respond with JSON only (no markdown, no code fences):
{{
  "in_scope": true or false,
  "subject": "mathematics" | "physics" | "chemistry" | "biology" | "history" | "politics" | "geography" | "economics" | "out_of_scope" | "unknown",
  "extracted_question": "full question text from the image",
  "image_summary": "one sentence describing what is in the image",
  "detected_topic": "main topic you see",
  "reason": "short explanation"
}}

Rules:
- Set in_scope to false if the question is NOT primarily about one of the eight allowed subjects.
- If the image has no clear academic question, set in_scope to false and explain in reason.
- If in_scope is true, subject must be one of the eight subject slugs (not unknown or out_of_scope).
"""


@lru_cache
def _groq_client(api_key: str) -> Groq:
    return Groq(api_key=api_key)


class ImageVisionService:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()

    def analyze(
        self,
        image_base64: str,
        mime_type: str = "image/jpeg",
        user_note: str = "",
    ) -> dict:
        cleaned_b64 = self._strip_data_url(image_base64)
        if not cleaned_b64:
            return self._error_result("Missing image.", "No image data received.")

        note = (user_note or "").strip()
        text_part = ANALYSIS_PROMPT
        if note:
            text_part += f"\n\nOptional note from the student: {note}"

        try:
            client = _groq_client(self._settings.groq_api_key)
            completion = client.chat.completions.create(
                model=self._settings.groq_vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": text_part},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{cleaned_b64}",
                                },
                            },
                        ],
                    }
                ],
                temperature=0.1,
            )
            raw = completion.choices[0].message.content or ""
            return self._parse_analysis_response(raw)
        except Exception as exc:
            return self._error_result(str(exc), "Could not analyze the image.")

    @staticmethod
    def _strip_data_url(value: str) -> str:
        if not value:
            return ""
        if "," in value and value.startswith("data:"):
            return value.split(",", 1)[1]
        return value.strip()

    @staticmethod
    def _error_result(reason: str, summary: str) -> dict:
        return {
            "in_scope": False,
            "subject": "unknown",
            "extracted_question": "",
            "image_summary": summary,
            "detected_topic": "unknown",
            "reason": reason,
        }

    def _parse_analysis_response(self, raw_response: str) -> dict:
        if not raw_response:
            return self._error_result("Empty vision response.", "Empty vision response.")

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`").strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        for candidate in (cleaned, self._extract_json_object(cleaned)):
            if not candidate:
                continue
            try:
                data = json.loads(candidate)
                if isinstance(data, dict):
                    return self._normalize_analysis(data)
            except json.JSONDecodeError:
                continue

        return self._error_result(
            "Could not parse vision model JSON.",
            cleaned[:200],
        )

    @staticmethod
    def _extract_json_object(text: str) -> str | None:
        match = re.search(r"\{[\s\S]*\}", text)
        return match.group(0) if match else None

    @staticmethod
    def _normalize_analysis(data: dict) -> dict:
        subject = str(data.get("subject", "unknown")).strip().lower().replace(" ", "_")
        if subject not in ALLOWED_SUBJECT_VALUES and subject not in (
            "out_of_scope",
            "unknown",
        ):
            subject = "unknown"

        in_scope = bool(data.get("in_scope", False))
        if in_scope and not is_allowed_subject(subject):
            in_scope = False
            if subject == "unknown":
                subject = "out_of_scope"

        return {
            "in_scope": in_scope,
            "subject": subject if is_allowed_subject(subject) else "out_of_scope",
            "extracted_question": str(data.get("extracted_question", "")).strip(),
            "image_summary": str(data.get("image_summary", "")).strip(),
            "detected_topic": str(data.get("detected_topic", "")).strip(),
            "reason": str(data.get("reason", "")).strip(),
        }


def build_image_message(analysis: dict, user_note: str = "") -> str:
    question = analysis.get("extracted_question") or user_note.strip()
    if not question:
        question = "Solve the problem shown in the uploaded image."

    parts = [
        f"[From uploaded image] {question}",
        f"Image context: {analysis.get('image_summary', '')}",
    ]
    if user_note.strip():
        parts.append(f"Student note: {user_note.strip()}")
    return "\n\n".join(parts)


def out_of_scope_image_response(analysis: dict) -> str:
    summary = analysis.get("image_summary") or "your uploaded image"
    topic = subject_label(analysis.get("detected_topic") or analysis.get("subject"))
    allowed = format_allowed_subjects_list()
    reason = analysis.get("reason", "")

    response = (
        f"I read your image. **What I see:** {summary}\n\n"
        f"I only tutor **{allowed}**.\n\n"
        f"Your image looks related to **{topic}**, which is outside my subjects. "
        "Please upload a question from one of those eight subjects."
    )
    if reason:
        response += f"\n\n_{reason}_"
    return response
