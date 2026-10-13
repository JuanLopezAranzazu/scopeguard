from .schemas import Analysis, Approach, Project, Tone

SPLIT_SYSTEM = """You split a client's message into individual work requests.
Rules:
- Return each concrete request as a short, self-contained sentence.
- Ignore greetings, pleasantries and phrases like "it's simple, right?".
- Do not invent requests the client did not make. Maximum 8.
- Answer in the same language as the message."""

ANALYZE_SYSTEM = """You are a project-scope analyst for freelancers.
You compare ONE new client request against the agreed scope.

Classify the request with "status":
- "in": clearly covered by something written in the agreed scope.
- "out": not covered by the agreed scope, or an exclusion leaves it out.
- "ambiguous": could be covered depending on interpretation, or information is missing to decide.

Strict rules:
1. Never assume features that are not written down. When in doubt use "ambiguous", never "in".
2. "evidence" must be a LITERAL quote, copied word for word, from ONE line of the agreed scope.
   - If status is "in", the quote is mandatory.
   - If an exclusion mentions the request, quote that exclusion.
   - If no line is relevant, leave "evidence" empty. NEVER invent quotes.
3. "reason": one sentence explaining the decision, in the language of the request.
4. "gap": what information is missing to decide with certainty (empty if nothing is missing).

Example:
Scope: "- Contact form" / Request: "Add a live chat"
-> {"status":"out","evidence":"","reason":"The scope only includes a contact form, not a live chat.","gap":""}"""


def analyze_user(scope: str, part: str, full_request: str) -> str:
    return (
        f"AGREED SCOPE:\n{scope}\n\n"
        f"FULL CLIENT MESSAGE (context only):\n{full_request.strip()}\n\n"
        f"REQUEST TO CLASSIFY:\n{part}"
    )


_TONES: dict[Tone, str] = {
    "formal": "formal and professional, polished and neutral",
    "friendly": "warm, approachable and collaborative, yet professional",
    "firm": "firm and direct, always respectful, no beating around the bush",
}

_APPROACHES: dict[Approach, str] = {
    "negotiate": (
        "GOAL: propose including the request as additional paid work.\n"
        "- Acknowledge what is already included in the agreement.\n"
        "- Explain which parts fall outside the original scope.\n"
        "- Propose an addendum or extra quote and mention the timeline may need adjusting.\n"
        "- Do NOT invent prices or hours. If an hourly rate is given, use it as a reference; "
        "otherwise offer to send a detailed quote."
    ),
    "clarify": (
        "GOAL: ask for clarification before committing.\n"
        "- Thank them and say you want to understand exactly what they need.\n"
        "- Ask 2 to 4 concrete questions based on the ambiguous points or missing information.\n"
        "- Do not accept or reject yet; say you will follow up with a proposal once they answer."
    ),
    "decline": (
        "GOAL: politely decline the request.\n"
        "- Briefly recall what was agreed and that this falls outside that scope.\n"
        "- Do not over-apologize or give false hope.\n"
        "- If the client wishes, offer to treat it as a separate future phase."
    ),
}


def respond_system(approach: Approach, tone: Tone) -> str:
    return (
        "You write short emails for a freelancer replying to a client.\n"
        f"Tone: {_TONES[tone]}.\n\n{_APPROACHES[approach]}\n\n"
        "General rules:\n"
        "- Write in first person, as the freelancer.\n"
        "- Reply in the same language as the client's message.\n"
        "- At most 170 words in the body. No long lists or jargon.\n"
        "- Use only the data provided; do not invent dates, prices or features.\n"
        '- Return JSON with "subject" (short subject line) and "body" (email body, with greeting and sign-off).'
    )


def respond_user(
    project: Project, request: str, analysis: Analysis, scope: str
) -> str:
    def fmt(status: str) -> str:
        rows = [f"- {i.request_part} ({i.reason})" for i in analysis.items if i.status == status]
        return "\n".join(rows) or "- (none)"

    extras = []
    if project.hourly_rate is not None:
        extras.append(f"Reference rate: {project.hourly_rate:g} {project.currency} per hour")
    if project.budget is not None:
        extras.append(f"Original budget: {project.budget:g} {project.currency}")
    if project.deadline.strip():
        extras.append(f"Original deadline: {project.deadline.strip()}")
    gaps = "\n".join(f"- {g}" for g in analysis.gaps) or "- (none)"

    return (
        f"Project: {project.name or '(unnamed)'}\n"
        f"Client: {project.client or '(unnamed)'}\n"
        f"Freelancer signature: {project.owner or '(do not sign with a name)'}\n"
        + ("\n".join(extras) + "\n" if extras else "")
        + f"\nAGREED SCOPE:\n{scope}\n\n"
        f"CLIENT MESSAGE:\n{request.strip()}\n\n"
        f"REQUESTS INSIDE THE SCOPE:\n{fmt('in')}\n\n"
        f"REQUESTS OUTSIDE THE SCOPE:\n{fmt('out')}\n\n"
        f"AMBIGUOUS REQUESTS:\n{fmt('ambiguous')}\n\n"
        f"MISSING INFORMATION:\n{gaps}"
    )
