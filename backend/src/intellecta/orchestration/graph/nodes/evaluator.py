"""
Evaluator Node — generates quiz questions and scores user answers adaptively.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from langchain_core.messages import AIMessage

from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine
from intellecta.orchestration.state import (
    ActiveAgent,
    AssessmentResult,
    QuizState,
    TutorState,
    UserIntent,
)
from intellecta.services.llm import ainvoke, get_chat_model

EVALUATOR_GENERATE_PROMPT = """You are the Evaluator agent for IntellectA — you create targeted quiz questions.

Only quiz on: Mathematics, Physics, Chemistry, Biology, History, Politics, Geography, Economics.

Generate ONE question at the specified difficulty (1=easy, 5=expert).
Focus on the concept slug provided. Avoid trick questions.

Respond ONLY with JSON:
{
  "question_text": "...",
  "expected_answer_hints": "key points the answer should cover",
  "concept_slug": "snake_case_topic"
}"""

EVALUATOR_SCORE_PROMPT = """You are the Evaluator agent scoring a student's answer.

Be fair but rigorous. Partial credit is allowed (score 0.0–1.0).
Identify specific misconceptions.

Respond ONLY with JSON:
{
  "is_correct": true | false,
  "score": 0.0 to 1.0,
  "feedback": "constructive feedback for the student",
  "misconceptions": ["list of specific errors or gaps"],
  "follow_up_question": "optional deeper question or null"
}"""


def _parse_json(raw: str) -> dict:
    cleaned = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence:
        cleaned = fence.group(1)
    return json.loads(cleaned)


def _latest_user_message(state: TutorState) -> str:
    messages = state.get("messages") or []
    for msg in reversed(messages):
        role = getattr(msg, "type", None) or (msg.get("role") if isinstance(msg, dict) else None)
        if role in ("human", "user"):
            return str(getattr(msg, "content", None) or msg.get("content", ""))
    return ""


async def evaluator_node(
    state: TutorState,
    *,
    assessment_engine: AdaptiveAssessmentEngine | None = None,
) -> dict:
    engine = assessment_engine or AdaptiveAssessmentEngine()
    intent = state.get("intent", UserIntent.QUIZ)

    if intent == UserIntent.EVALUATE_ANSWER:
        return await _evaluate_answer(state, engine)
    return await _generate_quiz(state, engine)


async def _generate_quiz(state: TutorState, engine: AdaptiveAssessmentEngine) -> dict:
    topic = (state.get("turn_metadata") or {}).get("detected_topic") or "general"
    user_id = state.get("user_id", "")
    concept_slug = str(topic).lower().replace(" ", "_")

    difficulty = await engine.get_difficulty(user_id, concept_slug)
    weak = state.get("weak_topics") or []

    user_prompt = (
        f"Concept: {concept_slug}\n"
        f"Difficulty: {difficulty:.1f}\n"
        f"Student weak areas: {', '.join(weak) if weak else 'unknown'}\n"
        f"Profile: {state.get('user_profile_summary') or 'none'}"
    )

    raw = await ainvoke(get_chat_model(temperature=0.5), EVALUATOR_GENERATE_PROMPT, user_prompt)
    try:
        parsed = _parse_json(raw)
    except json.JSONDecodeError:
        parsed = {
            "question_text": "Explain the core idea of this topic in your own words.",
            "expected_answer_hints": "main definition and one example",
            "concept_slug": concept_slug,
        }

    quiz_subject = state.get("subject") or concept_slug
    quiz: QuizState = {
        "question_id": f"q_{datetime.now(timezone.utc).timestamp():.0f}",
        "subject": quiz_subject if quiz_subject != "out_of_scope" else concept_slug,
        "concept_slug": parsed.get("concept_slug", concept_slug),
        "difficulty": difficulty,
        "question_text": parsed["question_text"],
        "expected_answer_hints": parsed.get("expected_answer_hints", ""),
        "started_at_iso": datetime.now(timezone.utc).isoformat(),
    }

    response = (
        f"**Quiz** (difficulty {difficulty:.1f}/5)\n\n"
        f"{quiz['question_text']}\n\n"
        "_Reply with your answer when ready._"
    )

    return {
        "active_agent": ActiveAgent.EVALUATOR,
        "quiz": quiz,
        "final_response": response,
        "messages": [AIMessage(content=response)],
        "should_persist_memory": False,
    }


async def _evaluate_answer(state: TutorState, engine: AdaptiveAssessmentEngine) -> dict:
    quiz = state.get("quiz") or {}
    user_answer = _latest_user_message(state)

    user_prompt = (
        f"Question: {quiz.get('question_text', 'unknown')}\n"
        f"Expected key points: {quiz.get('expected_answer_hints', '')}\n"
        f"Concept: {quiz.get('concept_slug', 'general')}\n\n"
        f"Student answer:\n{user_answer}"
    )

    raw = await ainvoke(get_chat_model(temperature=0.2), EVALUATOR_SCORE_PROMPT, user_prompt)
    try:
        parsed = _parse_json(raw)
    except json.JSONDecodeError:
        parsed = {
            "is_correct": False,
            "score": 0.0,
            "feedback": "I couldn't parse the evaluation. Please try again.",
            "misconceptions": [],
            "follow_up_question": None,
        }

    concept_slug = quiz.get("concept_slug", "general")
    current_difficulty = float(quiz.get("difficulty", 3.0))
    score = float(parsed.get("score", 0.0))
    is_correct = bool(parsed.get("is_correct", score >= 0.7))

    # Latency placeholder — wire from client metadata in production
    response_latency_ms = (state.get("turn_metadata") or {}).get("response_latency_ms", 10_000)

    next_difficulty = engine.compute_next_difficulty(
        current=current_difficulty,
        is_correct=is_correct,
        score=score,
        response_latency_ms=response_latency_ms,
    )

    await engine.record_attempt(
        user_id=state.get("user_id", ""),
        concept_slug=concept_slug,
        difficulty=current_difficulty,
        score=score,
        is_correct=is_correct,
        response_latency_ms=response_latency_ms,
    )

    assessment: AssessmentResult = {
        "is_correct": is_correct,
        "score": score,
        "feedback": parsed.get("feedback", ""),
        "misconceptions": parsed.get("misconceptions", []),
        "next_difficulty": next_difficulty,
        "follow_up_question": parsed.get("follow_up_question"),
    }

    emoji = "✓" if is_correct else "✗"
    response = (
        f"**{emoji} Score: {score:.0%}**\n\n"
        f"{assessment['feedback']}\n\n"
        f"_Next difficulty: {next_difficulty:.1f}/5_"
    )
    if assessment.get("follow_up_question"):
        response += f"\n\n**Follow-up:** {assessment['follow_up_question']}"

    misconceptions = assessment.get("misconceptions") or []
    insights = []
    if misconceptions:
        insights.append(
            f"Misconceptions on {concept_slug}: {'; '.join(misconceptions[:3])}"
        )

    return {
        "active_agent": ActiveAgent.EVALUATOR,
        "assessment": assessment,
        "quiz": None,  # clear active quiz after evaluation
        "final_response": response,
        "messages": [AIMessage(content=response)],
        "should_persist_memory": bool(insights),
        "memory_insights": insights,
    }
