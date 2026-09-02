"""
Built-in curriculum chunks for IntellectA RAG — one document per subject.

Run via: python -m intellecta.scripts.seed_rag
"""

from __future__ import annotations

from dataclasses import dataclass

from intellecta.orchestration.subjects import Subject


@dataclass(frozen=True)
class SeedChunk:
    concept_slug: str
    content: str


@dataclass(frozen=True)
class SeedDocument:
    title: str
    subject: str
    chunks: tuple[SeedChunk, ...]


CURRICULUM: tuple[SeedDocument, ...] = (
    SeedDocument(
        title="IntellectA Mathematics Core",
        subject=Subject.MATHEMATICS.value,
        chunks=(
            SeedChunk(
                "quadratic_formula",
                "The quadratic formula solves $ax^2+bx+c=0$: "
                "$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$ "
                "The discriminant $\\Delta=b^2-4ac$ tells you the nature of roots: "
                "$\\Delta>0$ two real roots, $\\Delta=0$ one repeated root, $\\Delta<0$ complex roots.",
            ),
            SeedChunk(
                "derivatives_rules",
                "Basic derivative rules: $\\frac{d}{dx}(x^n)=nx^{n-1}$, "
                "$\\frac{d}{dx}(e^x)=e^x$, product rule $(fg)'=f'g+fg'$, "
                "chain rule $\\frac{d}{dx}f(g(x))=f'(g(x))g'(x)$.",
            ),
            SeedChunk(
                "integration_basics",
                "Integration is the reverse of differentiation. "
                "$\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C$ for $n\\neq-1$. "
                "Definite integrals give signed area: $\\int_a^b f(x)\\,dx$.",
            ),
            SeedChunk(
                "probability_basics",
                "For events A and B: $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$. "
                "Conditional probability $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$. "
                "Independent events: $P(A\\cap B)=P(A)P(B)$.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Physics Core",
        subject=Subject.PHYSICS.value,
        chunks=(
            SeedChunk(
                "newtons_laws",
                "Newton's first law: an object remains at rest or uniform motion unless a net force acts. "
                "Second law: $\\vec F=m\\vec a$. Third law: action-reaction pairs are equal and opposite.",
            ),
            SeedChunk(
                "kinematics",
                "Constant acceleration: $v=u+at$, $s=ut+\\frac{1}{2}at^2$, $v^2=u^2+2as$. "
                "Displacement is a vector; distance is scalar path length.",
            ),
            SeedChunk(
                "energy_work",
                "Work $W=\\vec F\\cdot\\vec s$. Kinetic energy $KE=\\frac{1}{2}mv^2$. "
                "Gravitational PE near Earth: $PE=mgh$. Mechanical energy conserved if non-conservative work is zero.",
            ),
            SeedChunk(
                "ohms_law",
                "Ohm's law: $V=IR$. Power in a resistor $P=VI=I^2R$. "
                "Series resistors add; parallel: $\\frac{1}{R_{eq}}=\\sum\\frac{1}{R_i}$.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Chemistry Core",
        subject=Subject.CHEMISTRY.value,
        chunks=(
            SeedChunk(
                "atomic_structure",
                "Atoms have protons and neutrons in the nucleus, electrons in orbitals. "
                "Atomic number = protons; mass number = protons + neutrons. "
                "Isotopes share atomic number but differ in neutrons.",
            ),
            SeedChunk(
                "mole_stoichiometry",
                "The mole links mass to particle count: $n=\\frac{m}{M_r}$. "
                "Balanced equations give mole ratios for reacting species.",
            ),
            SeedChunk(
                "acids_bases",
                "Arrhenius: acids donate $\\ce{H+}$, bases donate $\\ce{OH-}$. "
                "pH scale: $\\text{pH}=-\\log_{10}[\\ce{H+}]$. "
                "Strong acids/bases dissociate fully; weak ones establish equilibrium.",
            ),
            SeedChunk(
                "equilibrium",
                "For $aA+bB\\rightleftharpoons cC+dD$, "
                "$$K_c=\\frac{[C]^c[D]^d}{[A]^a[B]^b}$$ "
                "Le Chatelier: systems shift to partially counteract imposed changes.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Biology Core",
        subject=Subject.BIOLOGY.value,
        chunks=(
            SeedChunk(
                "cell_theory",
                "Cell theory: all living things are made of cells; cells arise from pre-existing cells. "
                "Prokaryotes lack a nucleus; eukaryotes have membrane-bound organelles.",
            ),
            SeedChunk(
                "photosynthesis",
                "Photosynthesis: $6\\ce{CO2}+6\\ce{H2O}\\xrightarrow{light} \\ce{C6H12O6}+6\\ce{O2}$. "
                "Occurs in chloroplasts — light reactions (thylakoid) and Calvin cycle (stroma).",
            ),
            SeedChunk(
                "dna_replication",
                "DNA is a double helix with complementary base pairing A-T, C-G. "
                "Replication is semi-conservative: each new double helix has one old and one new strand.",
            ),
            SeedChunk(
                "natural_selection",
                "Natural selection: heritable variation + differential survival/reproduction → adaptation. "
                "Does not aim at progress; acts on phenotypes in specific environments.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA History Core",
        subject=Subject.HISTORY.value,
        chunks=(
            SeedChunk(
                "industrial_revolution",
                "The Industrial Revolution (c. 1760–1840) began in Britain with mechanized textile production, "
                "steam power, and factory systems. Effects: urbanization, new class structures, global trade shifts.",
            ),
            SeedChunk(
                "world_war_causes",
                "WWI causes include militarism, alliances, imperial rivalry, and nationalism (MAIN). "
                "Assassination of Archduke Franz Ferdinand (1914) triggered alliance escalation.",
            ),
            SeedChunk(
                "cold_war",
                "Cold War (1947–1991): US vs USSR ideological conflict without direct superpower war. "
                "Key features: nuclear deterrence, proxy wars, NATO vs Warsaw Pact, space race.",
            ),
            SeedChunk(
                "decolonization",
                "Post-WWII decolonization reshaped Africa and Asia. "
                "Nationalist movements, weakened European empires, and UN pressure drove independence waves.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Politics Core",
        subject=Subject.POLITICS.value,
        chunks=(
            SeedChunk(
                "separation_of_powers",
                "Montesquieu's separation of powers divides government into legislature, executive, judiciary "
                "to prevent tyranny. US Constitution exemplifies checks and balances.",
            ),
            SeedChunk(
                "democracy_types",
                "Direct democracy: citizens vote on laws. Representative democracy: elected officials legislate. "
                "Liberal democracy adds individual rights and rule of law constraints on majority power.",
            ),
            SeedChunk(
                "constitution_basics",
                "A constitution sets fundamental law, state structure, and rights. "
                "Written (codified) vs unwritten (UK conventions). Amendment procedures vary in rigidity.",
            ),
            SeedChunk(
                "political_ideologies",
                "Liberalism emphasizes individual rights and markets; socialism emphasizes equality and public ownership; "
                "conservatism emphasizes tradition and gradual change; nationalism centers national identity.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Geography Core",
        subject=Subject.GEOGRAPHY.value,
        chunks=(
            SeedChunk(
                "plate_tectonics",
                "Earth's lithosphere is divided into tectonic plates moving on the asthenosphere. "
                "Boundaries: divergent (ridges), convergent (subduction/orogeny), transform (shear).",
            ),
            SeedChunk(
                "climate_zones",
                "Köppen classification uses temperature and precipitation. "
                "Tropical (high temp year-round), arid (low precip), temperate (seasonal), polar (cold).",
            ),
            SeedChunk(
                "population_dynamics",
                "Demographic transition model links falling death/birth rates to development stages. "
                "Population density = people / area; distribution affected by resources, climate, history.",
            ),
            SeedChunk(
                "water_cycle",
                "The hydrologic cycle: evaporation → condensation → precipitation → runoff/infiltration. "
                "Watersheds drain to rivers; groundwater stored in aquifers.",
            ),
        ),
    ),
    SeedDocument(
        title="IntellectA Economics Core",
        subject=Subject.ECONOMICS.value,
        chunks=(
            SeedChunk(
                "supply_demand",
                "Law of demand: price up → quantity demanded down (ceteris paribus). "
                "Law of supply: price up → quantity supplied up. Equilibrium where curves intersect.",
            ),
            SeedChunk(
                "gdp_basics",
                "GDP measures market value of final goods/services produced domestically in a period. "
                "Real GDP adjusts for inflation; per capita GDP divides by population.",
            ),
            SeedChunk(
                "elasticity",
                "Price elasticity of demand $E_d=\\frac{\\%\\Delta Q_d}{\\%\\Delta P}$. "
                "|Ed|>1 elastic; |Ed|<1 inelastic. Elastic goods have many substitutes.",
            ),
            SeedChunk(
                "fiscal_policy",
                "Fiscal policy uses government spending and taxation to influence aggregate demand. "
                "Expansionary: higher spending or tax cuts in recessions. Contractionary: opposite in overheating.",
            ),
        ),
    ),
)
