from typing import Literal, Optional

from pydantic import BaseModel, Field

Status = Literal["in", "out", "ambiguous"]
Verdict = Literal["in_scope", "out_of_scope", "partial", "ambiguous"]
Approach = Literal["negotiate", "clarify", "decline"]
Tone = Literal["formal", "friendly", "firm"]


class Project(BaseModel):
    name: str = ""
    client: str = ""
    owner: str = ""  # freelancer name, used for the signature
    deliverables: list[str] = Field(default_factory=list)
    features: list[str] = Field(default_factory=list)
    exclusions: list[str] = Field(default_factory=list)
    budget: Optional[float] = None
    currency: str = "USD"
    hourly_rate: Optional[float] = None
    deadline: str = ""
    notes: str = ""


# ---- Schemas the model must follow (passed to Ollama as `format`) ----
class SplitOut(BaseModel):
    parts: list[str]


class PartOut(BaseModel):
    status: Status
    evidence: str = ""
    reason: str
    gap: str = ""


class MessageOut(BaseModel):
    subject: str
    body: str


# ---- Public API ----
class Item(BaseModel):
    request_part: str
    status: Status
    evidence: str = ""
    evidence_verified: bool = False
    reason: str = ""
    downgraded: bool = False  # model said "in" but the quote could not be verified


class Analysis(BaseModel):
    verdict: Verdict
    verified_count: int
    total_items: int
    items: list[Item]
    gaps: list[str]
    model: str
    elapsed_s: float


class AnalyzeRequest(BaseModel):
    project: Project
    request: str
    model: Optional[str] = None


class RespondRequest(BaseModel):
    project: Project
    request: str
    analysis: Analysis
    approach: Approach
    tone: Tone = "friendly"
    model: Optional[str] = None


class RespondOut(BaseModel):
    subject: str
    body: str
    model: str
