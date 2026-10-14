import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { Status, Verdict } from "../types";

export const statusMeta: Record<
  Status,
  { label: string; color: string; Icon: typeof XCircle }
> = {
  in: { label: "In scope", color: "verdict.in", Icon: CheckCircle2 },
  out: { label: "Out of scope", color: "verdict.out", Icon: XCircle },
  ambiguous: { label: "Ambiguous", color: "verdict.ambiguous", Icon: HelpCircle },
};

export const verdictMeta: Record<
  Verdict,
  { label: string; color: string; hint: string }
> = {
  in_scope: {
    label: "In scope",
    color: "verdict.in",
    hint: "Everything the client asks for is covered by the agreement.",
  },
  out_of_scope: {
    label: "Out of scope",
    color: "verdict.out",
    hint: "Nothing they ask for is covered. This is additional work.",
  },
  partial: {
    label: "Partly out of scope",
    color: "verdict.partial",
    hint: "Part of it is covered and part is additional work.",
  },
  ambiguous: {
    label: "Needs clarification",
    color: "verdict.ambiguous",
    hint: "The agreement does not allow a certain decision.",
  },
};
