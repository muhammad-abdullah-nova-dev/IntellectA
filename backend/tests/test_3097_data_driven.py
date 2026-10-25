"""Data-driven tests for member 3097 (Task 3).

The test data is read from CSV files in backend/data using csv.DictReader.
  - 3097_routing_data.csv  -> route_after_router
  - 3097_cors_data.csv     -> Settings.cors_origin_list
"""

import csv
from pathlib import Path

import pytest

from intellecta.config import Settings
from intellecta.orchestration.graph.routing import route_after_router

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


# DATA-DRIVEN TEST 1: where does the graph go after the router

@pytest.mark.routing
@pytest.mark.data_driven
@pytest.mark.parametrize("case", load_csv("3097_routing_data.csv"), ids=lambda c: c["test_id"])
def test_route_from_csv(case):
    """3097-CSV-ROUTE: next node for the state written in the CSV row."""
    state = {}
    if case["intent"] != "":
        state["intent"] = case["intent"]
    if case["in_scope"] != "":
        state["in_scope"] = case["in_scope"] == "True"
    if case["subject"] != "":
        state["subject"] = case["subject"]
    assert route_after_router(state) == case["expected"]


# DATA-DRIVEN TEST 2: splitting the CORS text

@pytest.mark.config
@pytest.mark.data_driven
@pytest.mark.bva
@pytest.mark.parametrize("case", load_csv("3097_cors_data.csv"), ids=lambda c: c["test_id"])
def test_cors_from_csv(case):
    """3097-CSV-CORS: number of origins (and the first one) for the text in the CSV row."""
    origins = Settings(_env_file=None, cors_origins=case["cors_origins"]).cors_origin_list
    assert len(origins) == int(case["expected_count"])
    if case["first_origin"] != "":
        assert origins[0] == case["first_origin"]
