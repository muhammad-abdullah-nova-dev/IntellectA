"""Member 3097 - Module 1: settings (config.py)

Test IDs match notes/3097_module1_config_notes.md
Settings objects are built with _env_file=None so a local .env file cannot change the results.
"""

import pytest

from intellecta.config import Settings, get_settings, reload_settings

pytestmark = [pytest.mark.config, pytest.mark.regression, pytest.mark.order(2)]


def make_settings(**values):
    return Settings(_env_file=None, **values)


# FUNCTION-LEVEL TESTS: uses_upstash_rest

@pytest.mark.smoke
@pytest.mark.order(1)
def test_upstash_both_values_set():
    """3097-CONFIG-UP-01: url and token both set -> True."""
    settings = make_settings(upstash_redis_rest_url="https://x.upstash.io", upstash_redis_rest_token="abc")
    assert settings.uses_upstash_rest is True


def test_upstash_default_is_false():
    """3097-CONFIG-UP-02: nothing set -> False."""
    assert make_settings().uses_upstash_rest is False


def test_upstash_only_url_set():
    """3097-CONFIG-UP-03: only the url is set -> False."""
    settings = make_settings(upstash_redis_rest_url="https://x.upstash.io")
    assert settings.uses_upstash_rest is False


def test_upstash_only_token_set():
    """3097-CONFIG-UP-04: only the token is set -> False."""
    settings = make_settings(upstash_redis_rest_token="abc")
    assert settings.uses_upstash_rest is False


@pytest.mark.bva
def test_upstash_one_character_values():
    """3097-CONFIG-UP-05: smallest non-empty values (1 character each) -> True."""
    settings = make_settings(upstash_redis_rest_url="u", upstash_redis_rest_token="t")
    assert settings.uses_upstash_rest is True


def test_upstash_spaces_count_as_values():
    """3097-CONFIG-UP-06: values made only of spaces still count as set -> True."""
    settings = make_settings(upstash_redis_rest_url="   ", upstash_redis_rest_token="   ")
    assert settings.uses_upstash_rest is True


# FUNCTION-LEVEL TESTS: cors_origin_list

@pytest.mark.bva
@pytest.mark.parametrize(
    "cors_value, expected",
    [
        pytest.param("http://localhost:3000", ["http://localhost:3000"], id="3097-CONFIG-CORS-01"),
        pytest.param("a.com,b.com", ["a.com", "b.com"], id="3097-CONFIG-CORS-02"),
        pytest.param(" a.com , b.com ", ["a.com", "b.com"], id="3097-CONFIG-CORS-03"),
        pytest.param("", [], id="3097-CONFIG-CORS-04"),
        pytest.param("a.com,", ["a.com"], id="3097-CONFIG-CORS-05"),
        pytest.param(",,,", [], id="3097-CONFIG-CORS-06"),
        pytest.param("a.com,,b.com", ["a.com", "b.com"], id="3097-CONFIG-CORS-07"),
        pytest.param("a,b,c,d,e", ["a", "b", "c", "d", "e"], id="3097-CONFIG-CORS-08"),
    ],
)
def test_cors_origin_list(cors_value, expected):
    """3097-CONFIG-CORS-01..08: splits the comma text, trims spaces and drops empty parts."""
    assert make_settings(cors_origins=cors_value).cors_origin_list == expected


# FUNCTION-LEVEL TESTS: get_settings

@pytest.mark.smoke
@pytest.mark.order(1)
def test_get_settings_returns_settings():
    """3097-CONFIG-GET-01: get_settings returns a Settings object."""
    assert isinstance(get_settings(), Settings)


def test_get_settings_is_cached():
    """3097-CONFIG-GET-02: calling twice returns the very same object."""
    assert get_settings() is get_settings()


def test_get_settings_new_object_after_cache_clear():
    """3097-CONFIG-GET-03: after cache_clear a new object is created."""
    first = get_settings()
    get_settings.cache_clear()
    second = get_settings()
    assert first is not second


def test_get_settings_reads_environment_variable(monkeypatch):
    """3097-CONFIG-GET-04: an environment variable is used as the value."""
    monkeypatch.setenv("GROQ_MODEL", "test-model")
    assert get_settings().groq_model == "test-model"


def test_get_settings_keeps_old_value_until_cleared(monkeypatch):
    """3097-CONFIG-GET-05: changing the variable later does not change the cached object."""
    monkeypatch.setenv("GROQ_MODEL", "first-model")
    get_settings()
    monkeypatch.setenv("GROQ_MODEL", "second-model")
    assert get_settings().groq_model == "first-model"


# FUNCTION-LEVEL TESTS: reload_settings

def test_reload_returns_settings():
    """3097-CONFIG-RELOAD-01: reload_settings returns a Settings object."""
    assert isinstance(reload_settings(), Settings)


def test_reload_picks_up_new_value(monkeypatch):
    """3097-CONFIG-RELOAD-02: reload reads the changed variable straight away."""
    monkeypatch.setenv("GROQ_MODEL", "first-model")
    get_settings()
    monkeypatch.setenv("GROQ_MODEL", "second-model")
    assert reload_settings().groq_model == "second-model"


def test_get_settings_returns_reloaded_object():
    """3097-CONFIG-RELOAD-03: after a reload, get_settings gives the reloaded object."""
    reloaded = reload_settings()
    assert get_settings() is reloaded


def test_reload_twice_gives_new_objects():
    """3097-CONFIG-RELOAD-04: every reload creates a fresh object."""
    first = reload_settings()
    second = reload_settings()
    assert first is not second


def test_reload_replaces_old_cached_object():
    """3097-CONFIG-RELOAD-05: the object cached before the reload is no longer returned."""
    old = get_settings()
    reload_settings()
    assert get_settings() is not old


# MODULE / CLASS-LEVEL TESTS: Settings defaults and cache states

def test_settings_cache_states_first_call_then_cached():
    """3097-CONFIG-MOD-01: NOT_LOADED -> CACHED: first call creates, second call reuses."""
    first = get_settings()
    second = get_settings()
    assert first is second


def test_settings_cache_state_is_stale_after_env_change(monkeypatch):
    """3097-CONFIG-MOD-02: CACHED stays CACHED when the environment changes."""
    monkeypatch.setenv("APP_ENV", "staging")
    first = get_settings()
    monkeypatch.setenv("APP_ENV", "production")
    assert get_settings().app_env == first.app_env == "staging"


def test_settings_cache_state_cleared_then_cached_again(monkeypatch):
    """3097-CONFIG-MOD-03: CACHED -> CLEARED -> CACHED sees the new value."""
    monkeypatch.setenv("APP_ENV", "staging")
    get_settings()
    monkeypatch.setenv("APP_ENV", "production")
    get_settings.cache_clear()
    assert get_settings().app_env == "production"


def test_reload_works_like_clear_and_load(monkeypatch):
    """3097-CONFIG-MOD-04: reload_settings = clear the cache + load again."""
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    get_settings()
    monkeypatch.setenv("LOG_LEVEL", "ERROR")
    reload_settings()
    assert get_settings().log_level == "ERROR"


def test_settings_default_values():
    """3097-CONFIG-MOD-05: important defaults of the Settings class."""
    settings = make_settings()
    assert settings.session_ttl_seconds == 86400
    assert settings.jwt_expire_days == 7
    assert settings.app_env == "development"
    assert settings.redis_url == "redis://localhost:6379/0"
    assert settings.groq_model == "llama-3.3-70b-versatile"


def test_settings_both_properties_from_environment(monkeypatch):
    """3097-CONFIG-MOD-06: both properties work with values coming from the environment."""
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://x.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "abc")
    monkeypatch.setenv("CORS_ORIGINS", "a.com, b.com")
    settings = get_settings()
    assert settings.uses_upstash_rest is True
    assert settings.cors_origin_list == ["a.com", "b.com"]
