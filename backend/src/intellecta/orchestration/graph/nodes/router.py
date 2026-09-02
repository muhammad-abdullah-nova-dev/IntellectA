"""
Router Node — classifies user intent, subject, and scope.
"""

from __future__ import annotations

import json
import re

from langchain_core.messages import HumanMessage

from intellecta.orchestration.state import ActiveAgent, TutorState, UserIntent
from intellecta.orchestration.subjects import (
    SUBJECT_SCOPE_DESCRIPTION,
    Subject,
    is_allowed_subject,
)
from intellecta.services.llm import ainvoke, get_router_model

ROUTER_SYSTEM_PROMPT = f"""You are the intent and subject router for IntellectA, an academic tutoring platform.

Route teaching requests to one of eight subject specialist agents (mathematics, physics, chemistry,
biology, history, politics, geography, economics). Your subject classification determines which
specialist handles the student.

Classify the student's latest message.

INTENT (exactly one):
- "learn" — wants explanation, teaching, concept breakdown, examples
- "quiz" — wants to be tested, asks for a question, says "quiz me"
- "evaluate_answer" — is answering a previously asked quiz/question
- "clarify" — ambiguous; still in-scope if about an allowed subject

{SUBJECT_SCOPE_DESCRIPTION}

Respond ONLY with valid JSON:
{{
  "intent": "learn" | "quiz" | "evaluate_answer" | "clarify",
  "subject": "mathematics" | "physics" | "chemistry" | "biology" | "history" | "politics" | "geography" | "economics" | "out_of_scope",
  "in_scope": true | false,
  "reason": "<one sentence>",
  "detected_topic": "<short topic label>"
}}"""


def _latest_user_message(state: TutorState) -> str:
    messages = state.get("messages") or []
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            return str(msg.content)
        if isinstance(msg, dict) and msg.get("role") == "user":
            return str(msg.get("content", ""))
    return ""


def _parse_router_json(raw: str) -> dict:
    cleaned = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence:
        cleaned = fence.group(1)
    return json.loads(cleaned)


async def router_node(state: TutorState) -> dict:
    user_text = _latest_user_message(state)
    quiz = state.get("quiz")

    quiz_context = ""
    if quiz and quiz.get("question_text"):
        quiz_context = (
            f"\n\nActive quiz question: {quiz['question_text']}\n"
            f"Concept: {quiz.get('concept_slug', 'unknown')}\n"
            "If the student message looks like an answer attempt, use evaluate_answer."
        )

    profile = state.get("user_profile_summary") or "No prior profile."
    weak = state.get("weak_topics") or []
    weak_str = ", ".join(weak) if weak else "none identified"

    user_prompt = (
        f"Student profile: {profile}\n"
        f"Weak topics: {weak_str}\n"
        f"{quiz_context}\n\n"
        f"Student message:\n{user_text}"
    )

    raw = await ainvoke(get_router_model(), ROUTER_SYSTEM_PROMPT, user_prompt)

    try:
        parsed = _parse_router_json(raw)
        intent_str = parsed.get("intent", "learn")
        intent = UserIntent(intent_str)
    except (json.JSONDecodeError, ValueError):
        intent = UserIntent.LEARN
        parsed = {
            "reason": "fallback: parse error",
            "detected_topic": None,
            "subject": Subject.MATHEMATICS.value,
            "in_scope": True,
        }

    subject = str(parsed.get("subject", Subject.OUT_OF_SCOPE.value)).lower().strip()
    in_scope = bool(parsed.get("in_scope", False))

    # Normalize scope from subject slug
    if subject == Subject.OUT_OF_SCOPE.value or not is_allowed_subject(subject):
        in_scope = False
        subject = Subject.OUT_OF_SCOPE.value
    else:
        in_scope = True

    # Active quiz answer — always in scope (quiz was already started)
    if quiz and quiz.get("question_text") and len(user_text.split()) < 80:
        if intent == UserIntent.LEARN:
            intent = UserIntent.EVALUATE_ANSWER
        in_scope = True
        if quiz.get("subject") and is_allowed_subject(str(quiz["subject"])):
            subject = str(quiz["subject"])

    return {
        "intent": intent,
        "subject": subject if in_scope else Subject.OUT_OF_SCOPE.value,
        "in_scope": in_scope,
        "active_agent": ActiveAgent.ROUTER,
        "router_reason": parsed.get("reason", ""),
        "turn_metadata": {
            **(state.get("turn_metadata") or {}),
            "detected_topic": parsed.get("detected_topic"),
            "subject": subject,
        },
    }
