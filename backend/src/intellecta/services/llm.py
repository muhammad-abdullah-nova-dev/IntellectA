"""LLM service abstraction — Groq via LangChain."""

from __future__ import annotations

from functools import lru_cache

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from intellecta.config import Settings, get_settings


@lru_cache
def get_chat_model(*, model: str | None = None, temperature: float = 0.3) -> BaseChatModel:
    settings = get_settings()
    return ChatGroq(
        api_key=settings.groq_api_key,
        model=model or settings.groq_model,
        temperature=temperature,
    )


def get_router_model() -> BaseChatModel:
    settings = get_settings()
    return get_chat_model(model=settings.groq_router_model, temperature=0.0)


async def ainvoke(
    llm: BaseChatModel,
    system: str,
    user: str,
) -> str:
    messages: list[BaseMessage] = [
        SystemMessage(content=system),
        HumanMessage(content=user),
    ]
    response = await llm.ainvoke(messages)
    content = response.content
    if isinstance(content, str):
        return content
    return str(content)
