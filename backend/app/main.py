import asyncio
import time

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import config
from .llm import LLMError, chat_json
from .logic import (
    build_scope_text,
    compute_verdict,
    has_scope,
    verifiable_text,
    verify_evidence,
)
from .prompts import (
    ANALYZE_SYSTEM,
    SPLIT_SYSTEM,
    analyze_user,
    respond_system,
    respond_user,
)
from .schemas import (
    Analysis,
    AnalyzeRequest,
    Item,
    MessageOut,
    PartOut,
    RespondOut,
    RespondRequest,
    SplitOut,
)

app = FastAPI(title="ScopeGuard API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(LLMError)
async def llm_error_handler(_, exc: LLMError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.get("/api/health")
async def health():
    info = {
        "ollama": False,
        "default_model": config.MODEL_NAME,
        "models": [],
        "default_installed": False,
    }
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get(f"{config.OLLAMA_URL}/api/tags")
        names = [m["name"] for m in r.json().get("models", [])]
        info["ollama"] = True
        info["models"] = names
        wanted = config.MODEL_NAME
        info["default_installed"] = wanted in names or f"{wanted}:latest" in names
    except Exception:
        pass
    return info


@app.post("/api/analyze", response_model=Analysis)
async def analyze(req: AnalyzeRequest):
    if not req.request.strip():
        raise HTTPException(422, "Paste the client message to analyze it.")
    if not has_scope(req.project):
        raise HTTPException(
            422, "Add at least one deliverable or feature to the scope."
        )

    model = req.model or config.MODEL_NAME
    t0 = time.perf_counter()
    scope = build_scope_text(req.project)
    source = verifiable_text(req.project)

    # 1) Split the request into parts: small models reason better this way.
    split = await chat_json(SplitOut, SPLIT_SYSTEM, req.request.strip(), model)
    parts = [p.strip() for p in split.parts if p.strip()][:8] or [req.request.strip()]

    # 2) Evaluate each part separately.
    async def run(part: str) -> PartOut:
        return await chat_json(
            PartOut, ANALYZE_SYSTEM, analyze_user(scope, part, req.request), model
        )

    outs = await asyncio.gather(*(run(p) for p in parts))

    # 3) Verify quotes in code, not with the model.
    items: list[Item] = []
    gaps: list[str] = []
    for part, out in zip(parts, outs):
        evidence = out.evidence.strip()
        verified = bool(evidence) and verify_evidence(evidence, source)
        status, downgraded = out.status, False
        if status == "in" and not verified:
            status, downgraded = "ambiguous", True
            gaps.append(
                f"No clause in the agreement backs this request: \"{part}\"."
            )
        if out.gap.strip():
            gaps.append(out.gap.strip())
        items.append(
            Item(
                request_part=part,
                status=status,
                evidence=evidence,
                evidence_verified=verified,
                reason=out.reason.strip(),
                downgraded=downgraded,
            )
        )

    return Analysis(
        verdict=compute_verdict(items),
        verified_count=sum(i.evidence_verified for i in items),
        total_items=len(items),
        items=items,
        gaps=list(dict.fromkeys(gaps)),
        model=model,
        elapsed_s=round(time.perf_counter() - t0, 1),
    )


@app.post("/api/respond", response_model=RespondOut)
async def respond(req: RespondRequest):
    model = req.model or config.MODEL_NAME
    scope = build_scope_text(req.project)
    out = await chat_json(
        MessageOut,
        respond_system(req.approach, req.tone),
        respond_user(req.project, req.request, req.analysis, scope),
        model,
    )
    return RespondOut(subject=out.subject.strip(), body=out.body.strip(), model=model)
