import re
import unicodedata

from .schemas import Item, Project, Verdict


def _scope_sections(p: Project) -> list[tuple[str, list[str]]]:
    sections: list[tuple[str, list[str]]] = [
        ("AGREED DELIVERABLES", [x for x in p.deliverables if x.strip()]),
        ("AGREED FEATURES", [x for x in p.features if x.strip()]),
        ("EXPLICIT EXCLUSIONS", [x for x in p.exclusions if x.strip()]),
    ]
    if p.deadline.strip():
        sections.append(("DEADLINE", [p.deadline.strip()]))
    if p.budget is not None:
        sections.append(("BUDGET", [f"{p.budget:g} {p.currency}"]))
    if p.notes.strip():
        sections.append(("AGREEMENT NOTES", [p.notes.strip()]))
    return [(h, lines) for h, lines in sections if lines]


def has_scope(p: Project) -> bool:
    return bool(
        [x for x in p.deliverables if x.strip()]
        or [x for x in p.features if x.strip()]
    )


def build_scope_text(p: Project) -> str:
    """Text the model sees (with headers)."""
    out = []
    for header, lines in _scope_sections(p):
        out.append(f"{header}:")
        out.extend(f"- {l}" for l in lines)
        out.append("")
    return "\n".join(out).strip()


def verifiable_text(p: Project) -> str:
    """Text that quotes are verified against (no headers, so the model
    cannot 'quote' a title and pass verification)."""
    return "\n".join(l for _, lines in _scope_sections(p) for l in lines)


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^\w\s]", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()


def verify_evidence(evidence: str, source: str) -> bool:
    """The quote must appear literally (ignoring case, accents and punctuation)."""
    e = _norm(evidence)
    if len(e) < 4:
        return False
    return e in _norm(source)


def compute_verdict(items: list[Item]) -> Verdict:
    statuses = {i.status for i in items}
    if statuses == {"in"}:
        return "in_scope"
    if statuses == {"out"}:
        return "out_of_scope"
    if "out" in statuses:
        return "partial"
    return "ambiguous"
