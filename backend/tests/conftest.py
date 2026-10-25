import pytest

from intellecta.config import get_settings


@pytest.fixture(autouse=True)
def clear_settings_cache():
    """Make sure cached settings never leak from one test to another."""
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
