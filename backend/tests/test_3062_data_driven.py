"""Data-driven tests for member 3062 (Task 3).

The test data is read from CSV files in backend/data using csv.DictReader.
  - 3062_difficulty_data.csv  -> compute_next_difficulty
  - 3062_bad_tokens_data.csv  -> decode_access_token
"""

import csv
from pathlib import Path

import pytest

from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine
from intellecta.auth.jwt import decode_access_token

# data-driven tests run after the module tests
pytestmark = pytest.mark.order(5)

DATA_FOLDER = Path(__file__).parent.parent / "data"


def load_csv(file_name):
    cases = []
    with open(DATA_FOLDER / file_name, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cases.append(row)
    return cases


# DATA-DRIVEN TEST 1: difficulty rules (each CSV row is one test case)

@pytest.mark.assessment
@pytest.mark.data_driven
@pytest.mark.bva
@pytest.mark.parametrize("case", load_csv("3062_difficulty_data.csv"), ids=lambda c: c["test_id"])
def test_difficulty_from_csv(case):
    """3062-CSV-DIFF: next difficulty for the values written in the CSV row."""
    engine = AdaptiveAssessmentEngine()
    result = engine.compute_next_difficulty(
        current=float(case["current"]),
        is_correct=case["is_correct"] == "True",
        score=float(case["score"]),
        response_latency_ms=int(case["latency_ms"]),
    )
    assert result == pytest.approx(float(case["expected"]))


# DATA-DRIVEN TEST 2: bad tokens must always be rejected

@pytest.mark.auth
@pytest.mark.data_driven
@pytest.mark.security
@pytest.mark.parametrize("case", load_csv("3062_bad_tokens_data.csv"), ids=lambda c: c["test_id"])
def test_bad_token_from_csv(case):
    """3062-CSV-TOKEN: every bad token in the CSV returns None."""
    assert decode_access_token(case["token"]) is None
