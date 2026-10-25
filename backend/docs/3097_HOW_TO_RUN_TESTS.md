# How to run the tests (member 3097)

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
| Settings (config.py) | tests/test_3097_module1_config.py | config |
| Allowed subjects (orchestration/subjects.py) | tests/test_3097_module2_subjects.py | subjects |
| Graph routing (orchestration/graph/routing.py) | tests/test_3097_module3_routing.py | routing |
| Data-driven tests (CSV files in data/) | tests/test_3097_data_driven.py | data_driven |

Test notes (ECP, BVA, error guessing, state machine, decision table) are in the `notes` folder.
The Excel sheet with the data-driven test cases is `docs/3097_test_cases.xlsx`.

## Groups (markers)

Markers are listed in `pytest.ini`: smoke, regression, config, subjects, routing, data_driven, bva, security.

## Running suites

```
pytest -m config               one module
pytest -m routing
pytest -m subjects
pytest -m smoke                quick checks
pytest -m data_driven          the CSV tests
pytest -m "config or routing"  two groups together
```

Or with the small runner:

```
python run_tests.py config
python run_tests.py subjects
python run_tests.py routing
python run_tests.py data
python run_tests.py parallel
```

## Running in parallel

```
pytest -n 4 --dist loadfile
```

## Execution order (pytest-order)

| Order | What runs |
|-------|-----------|
| 1 | smoke tests |
| 2 | settings module (config) |
| 3 | allowed subjects module |
| 4 | graph routing module |
| 5 | data-driven (CSV) tests |

## Parameterization

`@pytest.mark.parametrize` is used with `pytest.param(..., id=...)` so each row has its own test ID,
and the two CSV files are loaded with `csv.DictReader`.
