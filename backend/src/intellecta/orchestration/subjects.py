"""Allowed academic subjects for IntellectA — out-of-scope queries are rejected."""

from __future__ import annotations

from enum import Enum


class Subject(str, Enum):
    MATHEMATICS = "mathematics"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    HISTORY = "history"
    POLITICS = "politics"
    GEOGRAPHY = "geography"
    ECONOMICS = "economics"
    OUT_OF_SCOPE = "out_of_scope"


ALLOWED_SUBJECTS: tuple[Subject, ...] = (
    Subject.MATHEMATICS,
    Subject.PHYSICS,
    Subject.CHEMISTRY,
    Subject.BIOLOGY,
    Subject.HISTORY,
    Subject.POLITICS,
    Subject.GEOGRAPHY,
    Subject.ECONOMICS,
)

ALLOWED_SUBJECT_VALUES: frozenset[str] = frozenset(s.value for s in ALLOWED_SUBJECTS)

SUBJECT_LABELS: dict[str, str] = {
    Subject.MATHEMATICS.value: "Mathematics",
    Subject.PHYSICS.value: "Physics",
    Subject.CHEMISTRY.value: "Chemistry",
    Subject.BIOLOGY.value: "Biology",
    Subject.HISTORY.value: "History",
    Subject.POLITICS.value: "Politics",
    Subject.GEOGRAPHY.value: "Geography",
    Subject.ECONOMICS.value: "Economics",
}

SUBJECT_SCOPE_DESCRIPTION = """
Allowed subjects ONLY (classify into exactly one slug):
- mathematics — arithmetic, algebra, calculus, geometry, statistics, trigonometry
- physics — mechanics, thermodynamics, electromagnetism, optics, waves
- chemistry — atoms, molecules, reactions, periodic table, stoichiometry
- biology — cells, genetics, ecology, human body, evolution, botany, zoology
- history — historical events, civilizations, wars, timelines, leaders
- politics — government, constitution, political theory, elections, ideologies
- geography — maps, climate, landforms, countries, population, resources
- economics — micro/macro economics, supply-demand, GDP, markets, finance basics

If the question is NOT primarily about one of the above (e.g. coding, movies, sports,
cooking, relationship advice, general chit-chat), set subject to "out_of_scope" and in_scope to false.
""".strip()


def format_allowed_subjects_list() -> str:
    return ", ".join(SUBJECT_LABELS[s.value] for s in ALLOWED_SUBJECTS)


def subject_label(slug: str | None) -> str:
    if not slug or slug == Subject.OUT_OF_SCOPE.value:
        return "another topic"
    return SUBJECT_LABELS.get(slug, slug.replace("_", " ").title())


def is_allowed_subject(slug: str | None) -> bool:
    return bool(slug and slug in ALLOWED_SUBJECT_VALUES)
