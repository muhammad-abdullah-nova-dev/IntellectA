"""Small runner for the 3062 test suites.

Usage (from the backend folder):
    python run_tests.py            -> shows the list of suites
    python run_tests.py smoke      -> runs one suite
"""

import subprocess
import sys

# each suite is just a pytest command
SUITES = {
    "all": [],
    "smoke": ["-m", "smoke"],
    "regression": ["-m", "regression"],
    "auth": ["-m", "auth"],
    "assessment": ["-m", "assessment"],
    "memory": ["-m", "memory"],
    "data": ["-m", "data_driven"],
    "security": ["-m", "security"],
    "fast": ["-m", "not slow"],
    "parallel": ["-n", "4", "--dist", "loadfile"],
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in SUITES:
        print("Pick one suite:", ", ".join(SUITES))
        return 1

    suite = sys.argv[1]
    command = [sys.executable, "-m", "pytest", "-v"] + SUITES[suite]
    print("Running:", " ".join(command))
    return subprocess.call(command)


if __name__ == "__main__":
    sys.exit(main())
