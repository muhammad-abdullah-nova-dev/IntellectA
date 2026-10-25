# Test Design Notes - Module 1: Settings (config.py)

**Member:** 3097  
**Project:** IntellectA backend (Python, pytest)  
**File under test:** `config.py` (class `Settings`, functions `get_settings` and `reload_settings`)  
**Techniques:** ECP (Equivalence Class Partitioning), BVA (Boundary Value Analysis), EG (Error Guessing), SM (State Machine testing)

Behaviour taken from the source:
- `uses_upstash_rest` is True only when **both** the Upstash url and the Upstash token are non-empty text.
- `cors_origin_list` splits `cors_origins` at commas, trims spaces and drops empty parts.
- `get_settings()` is cached (`lru_cache`), so it returns the same object until `cache_clear()` is called.
- `reload_settings()` clears that cache and builds the settings again.

Settings objects in the tests are built with `Settings(_env_file=None, ...)`, so a local `.env` file cannot change the results. Environment variables are changed with `monkeypatch.setenv`.

Test ID format: `3097-CONFIG-<FUNCTION>-<NN>`

---

## 1. `uses_upstash_rest` (property)

| ID | Technique | Input | Expected result |
|----|-----------|-------|-----------------|
| 3097-CONFIG-UP-01 | ECP (valid) | url and token both set | `True` |
| 3097-CONFIG-UP-02 | ECP (default) | nothing set | `False` |
| 3097-CONFIG-UP-03 | ECP (invalid) | only the url is set | `False` |
| 3097-CONFIG-UP-04 | ECP (invalid) | only the token is set | `False` |
| 3097-CONFIG-UP-05 | BVA | url `"u"` and token `"t"` (1 character each) | `True` |
| 3097-CONFIG-UP-06 | EG | url and token are only spaces `"   "` | `True` (spaces count as a value) |

## 2. `cors_origin_list` (property)

| ID | Technique | Input (`cors_origins`) | Expected result |
|----|-----------|------------------------|-----------------|
| 3097-CONFIG-CORS-01 | ECP (valid) | `"http://localhost:3000"` | `["http://localhost:3000"]` |
| 3097-CONFIG-CORS-02 | ECP (valid) | `"a.com,b.com"` | `["a.com", "b.com"]` |
| 3097-CONFIG-CORS-03 | ECP (spaces) | `" a.com , b.com "` | `["a.com", "b.com"]` |
| 3097-CONFIG-CORS-04 | BVA (empty) | `""` | `[]` |
| 3097-CONFIG-CORS-05 | BVA (trailing comma) | `"a.com,"` | `["a.com"]` |
| 3097-CONFIG-CORS-06 | EG | `",,,"` | `[]` |
| 3097-CONFIG-CORS-07 | EG | `"a.com,,b.com"` (empty part in the middle) | `["a.com", "b.com"]` |
| 3097-CONFIG-CORS-08 | ECP (many) | `"a,b,c,d,e"` | 5 items in order |

## 3. `get_settings()`

| ID | Technique | Scenario | Expected result |
|----|-----------|----------|-----------------|
| 3097-CONFIG-GET-01 | ECP | call it once | returns a `Settings` object |
| 3097-CONFIG-GET-02 | ECP | call it twice | `first is second` (cached) |
| 3097-CONFIG-GET-03 | ECP | call, `cache_clear()`, call again | the two objects are different |
| 3097-CONFIG-GET-04 | ECP | environment variable `GROQ_MODEL=test-model` | `groq_model == "test-model"` |
| 3097-CONFIG-GET-05 | EG | change the variable after the first call | cached object still has the old value |

## 4. `reload_settings()`

| ID | Technique | Scenario | Expected result |
|----|-----------|----------|-----------------|
| 3097-CONFIG-RELOAD-01 | ECP | call it | returns a `Settings` object |
| 3097-CONFIG-RELOAD-02 | ECP | change the variable, then reload | new value is returned at once |
| 3097-CONFIG-RELOAD-03 | ECP | reload, then `get_settings()` | returns the reloaded object |
| 3097-CONFIG-RELOAD-04 | ECP | reload twice | two different objects |
| 3097-CONFIG-RELOAD-05 | ECP | get, reload, get | the object cached before the reload is gone |

---

## 5. Module-level tests: cache states and defaults (State Machine)

```
NOT_LOADED --get_settings()--> CACHED --get_settings()--> CACHED (same object)
CACHED --cache_clear()--> CLEARED --get_settings()--> CACHED (new object, new values)
CACHED --reload_settings()--> CACHED (new object, new values)
```

| ID | Technique | Transition / scenario | Expected result |
|----|-----------|-----------------------|-----------------|
| 3097-CONFIG-MOD-01 | SM | NOT_LOADED -> CACHED: call twice | same object both times |
| 3097-CONFIG-MOD-02 | SM | CACHED stays CACHED: change `APP_ENV` after the first call | old value `staging` is still returned |
| 3097-CONFIG-MOD-03 | SM | CACHED -> CLEARED -> CACHED | new value `production` is returned |
| 3097-CONFIG-MOD-04 | SM | CACHED -> reload -> CACHED | `LOG_LEVEL` shows the new value `ERROR` |
| 3097-CONFIG-MOD-05 | ECP | default values of the class | TTL 86400, JWT days 7, app_env development, default Redis url and Groq model |
| 3097-CONFIG-MOD-06 | Integration | Upstash url, token and CORS text from the environment | `uses_upstash_rest` is `True` and the CORS list has 2 items |
