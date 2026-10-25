# Member 3062 - Module 2: adaptive difficulty (assessment/adaptive_engine.py)
# Test IDs match notes/3062_module2_assessment_notes.md
# The database is replaced by a small fake repository.

import pytest

from intellecta.assessment.adaptive_engine import AdaptiveAssessmentEngine

pytestmark = [pytest.mark.assessment, pytest.mark.regression, pytest.mark.order(3)]


class FakeRepo:
    # remembers what the engine asked it to save
    def __init__(self, stored=None):
        self.stored = stored
        self.saved_difficulties = []
        self.saved_results = []

    async def get_concept_difficulty(self, user_id, concept_slug):
        return self.stored

    async def set_concept_difficulty(self, user_id, concept_slug, difficulty):
        self.saved_difficulties.append(difficulty)

    async def insert_quiz_result(self, record):
        self.saved_results.append(record)


def next_difficulty(current=2.5, is_correct=True, score=1.0, latency=10000):
    # shortcut so each test only writes the values it cares about
    engine = AdaptiveAssessmentEngine()
    return engine.compute_next_difficulty(
        current=current,
        is_correct=is_correct,
        score=score,
        response_latency_ms=latency,
    )


async def record(engine, difficulty=2.5, is_correct=True, score=1.0, latency=10000):
    return await engine.record_attempt(
        user_id="u1",
        concept_slug="loops",
        difficulty=difficulty,
        score=score,
        is_correct=is_correct,
        response_latency_ms=latency,
    )


# --- compute_next_difficulty ---

@pytest.mark.smoke
@pytest.mark.order(1)
@pytest.mark.parametrize(
    "is_correct, score, expected",
    [
        (False, 0.0, 2.0),
        (False, 0.39, 2.0),
        (False, 0.4, 2.4),
        (True, 0.69, 2.4),
        (True, 0.7, 2.7),
        (True, 1.0, 2.85),
    ],
)
def test_score_boundaries(is_correct, score, expected):
    """3062-ASSESS-NEXT-01 to 06  score boundaries (current 2.5, normal speed)"""
    assert next_difficulty(is_correct=is_correct, score=score) == pytest.approx(expected)


def test_wrong_answer_with_high_score_counts_as_partial():
    """3062-ASSESS-NEXT-07"""
    assert next_difficulty(is_correct=False, score=0.7) == pytest.approx(2.4)


def test_difficulty_never_goes_below_minimum():
    """3062-ASSESS-NEXT-08"""
    assert next_difficulty(current=1.0, is_correct=False, score=0.0) == 1.0


def test_difficulty_never_goes_above_maximum():
    """3062-ASSESS-NEXT-09"""
    assert next_difficulty(current=5.0, is_correct=True, score=1.0, latency=1000) == 5.0


def test_nan_score_is_treated_as_a_bad_score():
    """3062-ASSESS-NEXT-10"""
    assert next_difficulty(is_correct=False, score=float("nan")) == pytest.approx(2.0)


# --- get_difficulty ---

@pytest.mark.smoke
@pytest.mark.order(1)
async def test_default_difficulty_without_repository():
    """3062-ASSESS-GET-01"""
    engine = AdaptiveAssessmentEngine()
    assert await engine.get_difficulty("u1", "loops") == 2.5


async def test_difficulty_comes_from_repository():
    """3062-ASSESS-GET-02"""
    engine = AdaptiveAssessmentEngine(FakeRepo(stored=3.7))
    assert await engine.get_difficulty("u1", "loops") == 3.7


async def test_default_when_repository_has_nothing():
    """3062-ASSESS-GET-03"""
    engine = AdaptiveAssessmentEngine(FakeRepo(stored=None))
    assert await engine.get_difficulty("u1", "loops") == 2.5


async def test_difficulty_is_remembered_after_an_attempt():
    """3062-ASSESS-GET-04"""
    engine = AdaptiveAssessmentEngine()
    await record(engine)
    assert await engine.get_difficulty("u1", "loops") == pytest.approx(2.85)


async def test_stored_zero_is_returned_as_it_is():
    """3062-ASSESS-GET-05"""
    engine = AdaptiveAssessmentEngine(FakeRepo(stored=0.0))
    assert await engine.get_difficulty("u1", "loops") == 0.0


# --- record_attempt ---

async def test_record_attempt_works_without_repository():
    """3062-ASSESS-REC-01"""
    result = await record(AdaptiveAssessmentEngine())
    assert result.next == pytest.approx(2.85)


async def test_record_attempt_result_fields():
    """3062-ASSESS-REC-02"""
    result = await record(AdaptiveAssessmentEngine(), difficulty=2.5)
    assert result.previous == 2.5
    assert result.next == pytest.approx(2.85)
    assert result.delta == pytest.approx(0.35)


async def test_record_attempt_saves_new_difficulty():
    """3062-ASSESS-REC-03"""
    repo = FakeRepo()
    await record(AdaptiveAssessmentEngine(repo))
    assert len(repo.saved_difficulties) == 1
    assert repo.saved_difficulties[0] == pytest.approx(2.85)


async def test_record_attempt_saves_quiz_result():
    """3062-ASSESS-REC-04"""
    repo = FakeRepo()
    await record(AdaptiveAssessmentEngine(repo))
    assert len(repo.saved_results) == 1
    expected_keys = {
        "user_id",
        "concept_slug",
        "difficulty",
        "score",
        "is_correct",
        "response_latency_ms",
        "next_difficulty",
    }
    assert set(repo.saved_results[0]) == expected_keys


async def test_record_attempt_at_maximum_does_not_change():
    """3062-ASSESS-REC-05"""
    result = await record(AdaptiveAssessmentEngine(), difficulty=5.0, latency=1000)
    assert result.next == 5.0
    assert result.delta == 0.0


# --- whole class: climbing the difficulty scale ---

def test_state_climbs_to_maximum():
    """3062-ASSESS-MOD-01  five perfect fast answers in a row"""
    current = 2.5
    steps = []
    for _ in range(5):
        current = next_difficulty(current=current, is_correct=True, score=1.0, latency=1000)
        steps.append(current)
    assert steps == pytest.approx([3.05, 3.6, 4.15, 4.7, 5.0])


def test_state_stays_at_maximum():
    """3062-ASSESS-MOD-02  stays at the top"""
    current = 2.5
    for _ in range(6):
        current = next_difficulty(current=current, is_correct=True, score=1.0, latency=1000)
    assert current == 5.0


def test_state_one_failure_drops_from_maximum():
    """3062-ASSESS-MOD-03  one failure from the top"""
    assert next_difficulty(current=5.0, is_correct=False, score=0.0) == pytest.approx(4.5)


async def test_two_engines_are_independent():
    """3062-ASSESS-MOD-04  two engines do not share memory"""
    first = AdaptiveAssessmentEngine()
    second = AdaptiveAssessmentEngine()
    await record(first)
    assert await second.get_difficulty("u1", "loops") == 2.5


async def test_record_attempt_matches_compute():
    """3062-ASSESS-MOD-05  both ways of calculating give the same answer"""
    expected = next_difficulty(current=3.0, is_correct=True, score=0.8, latency=20000)
    result = await record(AdaptiveAssessmentEngine(), difficulty=3.0, score=0.8, latency=20000)
    assert result.next == pytest.approx(expected)
