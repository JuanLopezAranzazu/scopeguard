import type { Analysis, Approach, Health, Project, Reply, Tone } from "./types";

async function call<T>(path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the backend. Start FastAPI on port 8000."
    );
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.detail;
    throw new Error(
      typeof detail === "string" ? detail : `Server error ${res.status}`
    );
  }
  return res.json();
}

export const getHealth = () => call<Health>("/health");

export const analyze = (project: Project, request: string, model: string) =>
  call<Analysis>("/analyze", { project, request, model: model || null });

export const respond = (
  project: Project,
  request: string,
  analysis: Analysis,
  approach: Approach,
  tone: Tone,
  model: string
) =>
  call<Omit<Reply, "tone">>("/respond", {
    project,
    request,
    analysis,
    approach,
    tone,
    model: model || null,
  }).then((r): Reply => ({ ...r, tone }));
