# How to run the tests (member 3062)

Open a terminal in the `backend` folder and turn on the virtual environment first.

```
cd D:\IntellectA\backend
venv\Scripts\activate
```

## Setup (one time)

```
pip install -r requirements.txt
pip install pytest pytest-asyncio pytest-xdist pytest-order pytest-cov httpx
```

## What is tested

| Module | Test file | Marker |
|--------|-----------|--------|
| Auth (auth/jwt.py, db/repository/users.py) | tests/test_3062_module1_auth.py | auth |
| Adaptive assessment (assessment/adaptive_engine.py) | tests/test_3062_module2_assessment.py | assessment |
| Short-term memory (memory/short_term.py) | tests/test_3062_module3_memory.py | memory |
| Data-driven tests (CSV files in data/) | tests/test_3062_data_driven.py | data_driven |

Test notes (ECP, BVA, error guessing, state machine) are in the `notes` folder.
The Excel sheet with the data-driven test cases is `docs/3062_test_cases.xlsx`.

## Groups (markers)

Markers are listed in `pytest.ini`.

| Marker | Meaning |
|--------|---------|
| smoke | 15 quick checks, one or two per function group |
| regression | the full set of tests |
| auth, assessment, memory | one group per module |
| data_driven | tests that read their data from a CSV file |
| bva | boundary value tests |
| security | bad or unsafe input |
| slow | the one test that waits 3 seconds for a token to expire |

## Running suites

```
pytest                         all tests, in the set order
pytest -m smoke                smoke group only
pytest -m auth                 one module
pytest -m "auth or memory"     two groups together
pytest -m data_driven          the CSV tests
pytest -m "not slow"           everything except the slow test
```

There is also a small runner that does the same thing:

```
python run_tests.py            shows the list of suites
python run_tests.py smoke
python run_tests.py data
python run_tests.py parallel
```

## Running in parallel

```
pytest -n 4 --dist loadfile
```

`-n 4` starts 4 workers (pytest-xdist). `--dist loadfile` keeps all tests of one file on the same worker.
The suite is small, so the parallel run is not much faster here, but the setup works.

## Execution order (pytest-order)

Order is set with `@pytest.mark.order(number)`. Lower numbers run first.

| Order | What runs |
|-------|-----------|
| 1 | smoke tests (from all three modules) |
| 2 | auth module |
| 3 | assessment module |
| 4 | memory module |
| 5 | data-driven (CSV) tests |
| 6 | the slow token expiry test (always last) |

The order is exact when you run `pytest` normally. With `-n` the files are shared between workers,
so the global order can change.

## Parameterization

`@pytest.mark.parametrize` is used so one test function runs many inputs:
password lengths, blank names, score boundaries, limit values, and the two CSV files.
