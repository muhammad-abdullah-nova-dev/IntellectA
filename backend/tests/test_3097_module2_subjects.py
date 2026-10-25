"""Member 3097 - Module 2: allowed subjects (orchestration/subjects.py)

Test IDs match notes/3097_module2_subjects_notes.md
"""

import pytest

from intellecta.orchestration.subjects import (
    ALLOWED_SUBJECT_VALUES,
    ALLOWED_SUBJECTS,
    SUBJECT_LABELS,
    SUBJECT_SCOPE_DESCRIPTION,
    Subject,
    format_allowed_subjects_list,
    is_allowed_subject,
    subject_label,
)

pytestmark = [pytest.mark.subjects, pytest.mark.regression, pytest.mark.order(3)]

ALL_SLUGS = [
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "history",
    "politics",
    "geography",
    "economics",
]


# FUNCTION-LEVEL TESTS: subject_label

@pytest.mark.parametrize(
    "slug, expected",
    [
        pytest.param("mathematics", "Mathematics", id="3097-SUBJ-LABEL-01"),
        pytest.param("economics", "Economics", id="3097-SUBJ-LABEL-02"),
        pytest.param(None, "another topic", id="3097-SUBJ-LABEL-03"),
        pytest.param("", "another topic", id="3097-SUBJ-LABEL-04"),
        pytest.param("out_of_scope", "another topic", id="3097-SUBJ-LABEL-05"),
        pytest.param("computer_science", "Computer Science", id="3097-SUBJ-LABEL-06"),
        pytest.param("PHYSICS", "Physics", id="3097-SUBJ-LABEL-07"),
        pytest.param("  physics ", "  Physics ", id="3097-SUBJ-LABEL-08"),
    ],
)
def test_subject_label(slug, expected):
    """3097-SUBJ-LABEL-01..08: label for allowed, empty, out-of-scope and unknown slugs."""
    assert subject_label(slug) == expected


@pytest.mark.smoke
@pytest.mark.order(1)
@pytest.mark.parametrize("slug", ALL_SLUGS)
def test_subject_label_every_allowed_slug_has_a_name(slug):
    """3097-SUBJ-LABEL-09: every allowed slug gives a capitalised label, not the fallback."""
    label = subject_label(slug)
    assert label == slug.title()
    assert label != "another topic"


# FUNCTION-LEVEL TESTS: is_allowed_subject

@pytest.mark.bva
@pytest.mark.parametrize(
    "slug, expected",
    [
        pytest.param("mathematics", True, id="3097-SUBJ-ALLOWED-01"),
        pytest.param("economics", True, id="3097-SUBJ-ALLOWED-02"),
        pytest.param("out_of_scope", False, id="3097-SUBJ-ALLOWED-03"),
        pytest.param(None, False, id="3097-SUBJ-ALLOWED-04"),
        pytest.param("", False, id="3097-SUBJ-ALLOWED-05"),
        pytest.param("Physics", False, id="3097-SUBJ-ALLOWED-06"),
        pytest.param("physics ", False, id="3097-SUBJ-ALLOWED-07"),
        pytest.param("coding", False, id="3097-SUBJ-ALLOWED-08"),
        pytest.param(123, False, id="3097-SUBJ-ALLOWED-09"),
    ],
)
def test_is_allowed_subject(slug, expected):
    """3097-SUBJ-ALLOWED-01..09: only the exact lowercase slugs of the 8 subjects are allowed."""
    assert is_allowed_subject(slug) is expected


@pytest.mark.smoke
@pytest.mark.order(1)
def test_is_allowed_subject_list_input_fails():
    """3097-SUBJ-ALLOWED-10: a list cannot be looked up in the frozenset -> TypeError."""
    with pytest.raises(TypeError):
        is_allowed_subject(["physics"])


# FUNCTION-LEVEL TESTS: format_allowed_subjects_list

@pytest.mark.smoke
@pytest.mark.order(1)
def test_format_list_exact_text():
    """3097-SUBJ-FORMAT-01: exact text with the 8 labels in order."""
    expected = "Mathematics, Physics, Chemistry, Biology, History, Politics, Geography, Economics"
    assert format_allowed_subjects_list() == expected


def test_format_list_has_seven_separators():
    """3097-SUBJ-FORMAT-02: 8 labels are joined by 7 separators."""
    assert format_allowed_subjects_list().count(", ") == 7


def test_format_list_contains_every_label():
    """3097-SUBJ-FORMAT-03: every allowed label appears in the text."""
    text = format_allowed_subjects_list()
    for slug in ALL_SLUGS:
        assert SUBJECT_LABELS[slug] in text


def test_format_list_follows_allowed_subjects_order():
    """3097-SUBJ-FORMAT-04: labels come in the same order as ALLOWED_SUBJECTS."""
    labels = format_allowed_subjects_list().split(", ")
    expected = [SUBJECT_LABELS[s.value] for s in ALLOWED_SUBJECTS]
    assert labels == expected


def test_format_list_has_no_out_of_scope_text():
    """3097-SUBJ-FORMAT-05: out of scope is never listed as a subject."""
    text = format_allowed_subjects_list().lower()
    assert "out of scope" not in text
    assert "out_of_scope" not in text
    assert "another topic" not in text


def test_format_list_has_no_trailing_separator():
    """3097-SUBJ-FORMAT-06: the text does not end with a comma or space."""
    text = format_allowed_subjects_list()
    assert not text.endswith(",")
    assert not text.endswith(" ")


def test_format_list_first_and_last():
    """3097-SUBJ-FORMAT-07: first label is Mathematics, last is Economics."""
    labels = format_allowed_subjects_list().split(", ")
    assert labels[0] == "Mathematics"
    assert labels[-1] == "Economics"


# MODULE / CLASS-LEVEL TESTS: constants and the Subject enum

def test_allowed_subjects_has_eight_and_no_out_of_scope():
    """3097-SUBJ-MOD-01: 8 allowed subjects and OUT_OF_SCOPE is not one of them."""
    assert len(ALLOWED_SUBJECTS) == 8
    assert Subject.OUT_OF_SCOPE not in ALLOWED_SUBJECTS


def test_allowed_values_match_allowed_subjects():
    """3097-SUBJ-MOD-02: ALLOWED_SUBJECT_VALUES holds the 8 slugs from ALLOWED_SUBJECTS."""
    assert ALLOWED_SUBJECT_VALUES == frozenset(ALL_SLUGS)
    assert len(ALLOWED_SUBJECT_VALUES) == 8


def test_labels_keys_match_allowed_values():
    """3097-SUBJ-MOD-03: SUBJECT_LABELS has one label for each allowed slug and nothing else."""
    assert set(SUBJECT_LABELS) == set(ALLOWED_SUBJECT_VALUES)


@pytest.mark.parametrize("slug", ALL_SLUGS)
def test_every_allowed_slug_is_allowed_and_labelled(slug):
    """3097-SUBJ-MOD-04: each allowed slug passes is_allowed_subject and has a label."""
    assert is_allowed_subject(slug) is True
    assert slug in SUBJECT_LABELS


def test_subject_enum_behaves_like_text():
    """3097-SUBJ-MOD-05: Subject members are strings, so they equal their slug text."""
    assert Subject.PHYSICS == "physics"
    assert is_allowed_subject(Subject.PHYSICS) is True


def test_out_of_scope_exists_but_is_not_allowed():
    """3097-SUBJ-MOD-06: out_of_scope is in the enum but is not an allowed subject."""
    assert Subject.OUT_OF_SCOPE.value == "out_of_scope"
    assert is_allowed_subject(Subject.OUT_OF_SCOPE.value) is False


def test_scope_description_mentions_every_slug():
    """3097-SUBJ-MOD-07: the router prompt text names all 8 slugs and out_of_scope."""
    for slug in ALL_SLUGS:
        assert slug in SUBJECT_SCOPE_DESCRIPTION
    assert "out_of_scope" in SUBJECT_SCOPE_DESCRIPTION
