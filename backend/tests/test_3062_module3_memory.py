# Member 3062 - Module 3: session memory (memory/short_term.py)
# Test IDs match notes/3062_module3_memory_notes.md
# Redis is replaced with a mock (to check calls) or a small fake (to check results).

import json
from unittest.mock import AsyncMock

import pytest

from intellecta.config import Settings
from intellecta.memory.short_term import ShortTermMemory

pytestmark = [pytest.mark.memory, pytest.mark.regression, pytest.mark.order(4)]

MESSAGES_KEY = "session:s1:messages"
QUIZ_KEY = "session:s1:quiz"


class FakeRedis:
    # a tiny in-memory Redis with only the commands ShortTermMemory uses
    def __init__(self):
        self.lists = {}
        self.values = {}

    async def rpush(self, key, *items):
        self.lists.setdefault(key, []).extend(items)

    async def lrange(self, key, start, stop):
        items = self.lists.get(key, [])
        return items[start:]  # ShortTermMemory always passes stop = -1

    async def expire(self, key, seconds):
        pass

    async def delete(self, key):
        self.lists.pop(key, None)
        self.values.pop(key, None)

    async def set(self, key, value, ex=None):
        self.values[key] = value

    async def get(self, key):
        return self.values.get(key)


def make_memory(redis, ttl=86400):
    settings = Settings(_env_file=None, session_ttl_seconds=ttl)
    return ShortTermMemory(redis, settings)


# --- append_message ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_append_pushes_json_message():
    """3062-MEM-APPEND-01"""
    redis = AsyncMock()
    await make_memory(redis).append_message("s1", "user", "hi")
    expected = json.dumps({"role": "user", "content": "hi"})
    redis.rpush.assert_awaited_once_with(MESSAGES_KEY, expected)


async def test_append_sets_expiry():
    """3062-MEM-APPEND-02"""
    redis = AsyncMock()
    await make_memory(redis).append_message("s1", "user", "hi")
    redis.expire.assert_awaited_once_with(MESSAGES_KEY, 86400)


async def test_append_empty_content():
    """3062-MEM-APPEND-03"""
    redis = AsyncMock()
    await make_memory(redis).append_message("s1", "user", "")
    pushed = redis.rpush.await_args.args[1]
    assert json.loads(pushed)["content"] == ""


async def test_append_unicode_text():
    """3062-MEM-APPEND-04"""
    redis = AsyncMock()
    text = "سلام دنیا 😀"
    await make_memory(redis).append_message("s1", "user", text)
    pushed = redis.rpush.await_args.args[1]
    assert json.loads(pushed)["content"] == text


async def test_append_stops_when_redis_fails():
    """3062-MEM-APPEND-05"""
    redis = AsyncMock()
    redis.rpush.side_effect = ConnectionError("redis is down")
    with pytest.raises(ConnectionError):
        await make_memory(redis).append_message("s1", "user", "hi")
    redis.expire.assert_not_awaited()


async def test_append_quotes_and_newlines():
    """3062-MEM-APPEND-06"""
    redis = AsyncMock()
    text = 'He said "hello"\nsecond line'
    await make_memory(redis).append_message("s1", "user", text)
    pushed = redis.rpush.await_args.args[1]
    assert json.loads(pushed)["content"] == text


# --- get_messages ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_get_returns_messages_in_order():
    """3062-MEM-GET-01"""
    first = {"role": "user", "content": "hi"}
    second = {"role": "assistant", "content": "hello"}
    redis = AsyncMock()
    redis.lrange.return_value = [json.dumps(first), json.dumps(second)]
    assert await make_memory(redis).get_messages("s1") == [first, second]


async def test_get_empty_list():
    """3062-MEM-GET-02"""
    redis = AsyncMock()
    redis.lrange.return_value = []
    assert await make_memory(redis).get_messages("s1") == []


@pytest.mark.parametrize(
    "limit, expected_start",
    [
        (None, -20),  # default limit
        (1, -1),
        (0, 0),  # limit 0 asks for the whole list
    ],
)
async def test_get_uses_limit_in_lrange(limit, expected_start):
    """3062-MEM-GET-03 to 05  limit values"""
    redis = AsyncMock()
    redis.lrange.return_value = []
    memory = make_memory(redis)
    if limit is None:
        await memory.get_messages("s1")
    else:
        await memory.get_messages("s1", limit=limit)
    redis.lrange.assert_awaited_once_with(MESSAGES_KEY, expected_start, -1)


async def test_get_with_broken_json():
    """3062-MEM-GET-06"""
    redis = AsyncMock()
    redis.lrange.return_value = ["this is not json"]
    with pytest.raises(json.JSONDecodeError):
        await make_memory(redis).get_messages("s1")


# --- replace_messages ---

async def test_replace_deletes_then_pushes_then_expires():
    """3062-MEM-REPL-01"""
    redis = AsyncMock()
    messages = [{"role": "user", "content": str(i)} for i in range(3)]
    await make_memory(redis).replace_messages("s1", messages)
    call_names = [call[0] for call in redis.mock_calls]
    assert call_names == ["delete", "rpush", "expire"]
    assert len(redis.rpush.await_args.args) == 1 + 3  # key plus 3 messages


async def test_replace_with_empty_list_only_deletes():
    """3062-MEM-REPL-02"""
    redis = AsyncMock()
    await make_memory(redis).replace_messages("s1", [])
    redis.delete.assert_awaited_once_with(MESSAGES_KEY)
    redis.rpush.assert_not_awaited()
    redis.expire.assert_not_awaited()


async def test_replace_with_one_message():
    """3062-MEM-REPL-03"""
    redis = AsyncMock()
    await make_memory(redis).replace_messages("s1", [{"role": "user", "content": "only one"}])
    assert len(redis.rpush.await_args.args) == 1 + 1


async def test_replace_keeps_only_role_and_content():
    """3062-MEM-REPL-04"""
    redis = AsyncMock()
    message = {"role": "user", "content": "hi", "id": 99}
    await make_memory(redis).replace_messages("s1", [message])
    saved = json.loads(redis.rpush.await_args.args[1])
    assert saved == {"role": "user", "content": "hi"}


async def test_replace_message_without_content_fails():
    """3062-MEM-REPL-05"""
    redis = AsyncMock()
    with pytest.raises(KeyError):
        await make_memory(redis).replace_messages("s1", [{"role": "user"}])


# --- set_quiz_state ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_set_quiz_saves_json_with_expiry():
    """3062-MEM-SETQ-01"""
    redis = AsyncMock()
    quiz = {"question": "2+2", "difficulty": 1.0}
    await make_memory(redis).set_quiz_state("s1", quiz)
    redis.set.assert_awaited_once_with(QUIZ_KEY, json.dumps(quiz), ex=86400)


async def test_set_quiz_none_deletes_the_key():
    """3062-MEM-SETQ-02"""
    redis = AsyncMock()
    await make_memory(redis).set_quiz_state("s1", None)
    redis.delete.assert_awaited_once_with(QUIZ_KEY)
    redis.set.assert_not_awaited()


async def test_set_quiz_empty_dict_is_saved():
    """3062-MEM-SETQ-03"""
    redis = AsyncMock()
    await make_memory(redis).set_quiz_state("s1", {})
    redis.set.assert_awaited_once_with(QUIZ_KEY, "{}", ex=86400)


async def test_set_quiz_uses_ttl_from_settings():
    """3062-MEM-SETQ-04"""
    redis = AsyncMock()
    await make_memory(redis, ttl=1).set_quiz_state("s1", {"q": 1})
    assert redis.set.await_args.kwargs["ex"] == 1


async def test_set_quiz_with_data_json_cannot_store():
    """3062-MEM-SETQ-05"""
    redis = AsyncMock()
    with pytest.raises(TypeError):
        await make_memory(redis).set_quiz_state("s1", {"options": {1, 2}})
    redis.set.assert_not_awaited()


# --- get_quiz_state ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_get_quiz_returns_dict():
    """3062-MEM-GETQ-01"""
    redis = AsyncMock()
    redis.get.return_value = '{"question": "2+2"}'
    assert await make_memory(redis).get_quiz_state("s1") == {"question": "2+2"}


async def test_get_quiz_missing_returns_none():
    """3062-MEM-GETQ-02"""
    redis = AsyncMock()
    redis.get.return_value = None
    assert await make_memory(redis).get_quiz_state("s1") is None


async def test_get_quiz_empty_string_returns_none():
    """3062-MEM-GETQ-03"""
    redis = AsyncMock()
    redis.get.return_value = ""
    assert await make_memory(redis).get_quiz_state("s1") is None


async def test_get_quiz_keeps_float_and_list():
    """3062-MEM-GETQ-04"""
    redis = AsyncMock()
    redis.get.return_value = '{"difficulty": 1.0, "options": ["a", "b"]}'
    quiz = await make_memory(redis).get_quiz_state("s1")
    assert quiz["difficulty"] == 1.0
    assert quiz["options"] == ["a", "b"]


async def test_get_quiz_with_broken_json():
    """3062-MEM-GETQ-05"""
    redis = AsyncMock()
    redis.get.return_value = "{not valid json"
    with pytest.raises(json.JSONDecodeError):
        await make_memory(redis).get_quiz_state("s1")


# --- whole class: quiz state steps (uses FakeRedis) ---

async def test_state_starts_with_no_quiz():
    """3062-MEM-MOD-01  NO_QUIZ"""
    memory = make_memory(FakeRedis())
    assert await memory.get_quiz_state("s1") is None


async def test_state_quiz_becomes_active():
    """3062-MEM-MOD-02  NO_QUIZ -> ACTIVE"""
    memory = make_memory(FakeRedis())
    await memory.set_quiz_state("s1", {"question": "2+2"})
    assert await memory.get_quiz_state("s1") == {"question": "2+2"}


async def test_state_new_quiz_replaces_old_one():
    """3062-MEM-MOD-03  ACTIVE -> ACTIVE (replaced)"""
    memory = make_memory(FakeRedis())
    await memory.set_quiz_state("s1", {"question": "first"})
    await memory.set_quiz_state("s1", {"question": "second"})
    assert await memory.get_quiz_state("s1") == {"question": "second"}


async def test_state_quiz_is_cleared():
    """3062-MEM-MOD-04  ACTIVE -> NO_QUIZ"""
    memory = make_memory(FakeRedis())
    await memory.set_quiz_state("s1", {"question": "2+2"})
    await memory.set_quiz_state("s1", None)
    assert await memory.get_quiz_state("s1") is None


async def test_state_clearing_twice_is_fine():
    """3062-MEM-MOD-05  NO_QUIZ -> NO_QUIZ (clear twice)"""
    memory = make_memory(FakeRedis())
    await memory.set_quiz_state("s1", None)
    await memory.set_quiz_state("s1", None)
    assert await memory.get_quiz_state("s1") is None


async def test_last_two_messages_are_returned():
    """3062-MEM-MOD-06  last two messages come back in order"""
    memory = make_memory(FakeRedis())
    for text in ["one", "two", "three"]:
        await memory.append_message("s1", "user", text)
    last_two = await memory.get_messages("s1", limit=2)
    assert [m["content"] for m in last_two] == ["two", "three"]
