export type Status = "in" | "out" | "ambiguous";
export type Verdict = "in_scope" | "out_of_scope" | "partial" | "ambiguous";
export type Approach = "negotiate" | "clarify" | "decline";
export type Tone = "formal" | "friendly" | "firm";

export interface Project {
  name: string;
  client: string;
  owner: string;
  deliverables: string[];
  features: string[];
  exclusions: string[];
  budget: number | null;
  currency: string;
  hourly_rate: number | null;
  deadline: string;
  notes: string;
}

export interface Item {
  request_part: string;
  status: Status;
  evidence: string;
  evidence_verified: boolean;
  reason: string;
  downgraded: boolean;
}

export interface Analysis {
  verdict: Verdict;
  verified_count: number;
  total_items: number;
  items: Item[];
  gaps: string[];
  model: string;
  elapsed_s: number;
}

export interface Reply {
  subject: string;
  body: string;
  model: string;
  tone: Tone;
}

export type Replies = Partial<Record<Approach, Reply>>;

export interface Health {
  ollama: boolean;
  default_model: string;
  models: string[];
  default_installed: boolean;
}

export const emptyProject: Project = {
  name: "",
  client: "",
  owner: "",
  deliverables: [],
  features: [],
  exclusions: [],
  budget: null,
  currency: "USD",
  hourly_rate: null,
  deadline: "",
  notes: "",
};
