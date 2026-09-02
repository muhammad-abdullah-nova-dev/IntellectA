"""Shared formatting instructions for subject specialist agents."""

LATEX_MATH_INSTRUCTIONS = """
When writing mathematics, always use LaTeX so equations render properly:
- Inline math: wrap in single dollar signs, e.g. $\\frac{d}{dx}(x^2) = 2x$
- Display math: wrap in double dollar signs on their own lines, e.g.
$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$
Use \\frac, \\int, \\sum, \\lim, \\sqrt, \\partial, \\infty. Show step-by-step work when helpful.
"""

FBD_INSTRUCTIONS = """
When the student asks for a free body diagram (FBD):
1. Start with a short heading and a markdown TABLE of forces (name, symbol, direction).
2. Draw the diagram using ASCII inside a ``` code block (arrows with ↑ ↓ ← →).
3. Put explanations OUTSIDE all $$ blocks.
"""

CHEMISTRY_LATEX_INSTRUCTIONS = """
For chemistry calculations use LaTeX:
- Inline: $E = E^{\\circ} - \\frac{RT}{nF}\\ln Q$
- Chemical formulas: $\\ce{H2O}$, $\\ce{O2}$, display $$\\ce{3Fe + 2O2 -> Fe3O4}$$
- pH: $\\text{pH} = -\\log_{10}[\\ce{H+}]$
- Gas law: $$PV = nRT$$
Never write formulas as plain ASCII without $ delimiters.
"""

TEACHING_PRINCIPLES = """
Teaching principles:
1. Scaffold from what the student likely knows.
2. Use retrieved reference material when provided — prefer it over guessing.
3. Personalize using weak topics when listed.
4. Structure: definition → intuition → worked example → check-for-understanding.
5. Keep responses focused (2–4 paragraphs unless more is needed).
6. End with one short question to verify understanding.
"""
