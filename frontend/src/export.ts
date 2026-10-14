import type { Analysis, Approach, Project, Replies, Status } from "./types";

export const statusLabel: Record<Status, string> = {
  in: "In scope",
  out: "Out of scope",
  ambiguous: "Ambiguous",
};

export const approachLabel: Record<Approach, string> = {
  negotiate: "Negotiate an add-on",
  clarify: "Ask for clarification",
  decline: "Decline",
};

export function toMarkdown(
  project: Project,
  request: string,
  a: Analysis,
  replies: Replies
): string {
  const L: string[] = [];
  L.push(`# Request analysis: ${project.name || "Untitled project"}`);
  L.push("");
  L.push(
    `Generated on ${new Date().toLocaleString("en")} with model \`${a.model}\` (${a.elapsed_s} s).`
  );
  L.push("");
  L.push("## Client message", "", ...request.trim().split("\n").map((l) => `> ${l}`), "");
  L.push("## Result", "");
  L.push(
    `${a.verified_count} of ${a.total_items} requests backed by a verified quote from the agreement.`,
    ""
  );
  a.items.forEach((it, i) => {
    L.push(`### ${i + 1}. ${it.request_part}`, "");
    L.push(`- **Status:** ${statusLabel[it.status]}`);
    if (it.reason) L.push(`- **Reason:** ${it.reason}`);
    if (it.evidence)
      L.push(
        `- **Quote from the agreement:** “${it.evidence}” (${it.evidence_verified ? "verified" : "unverified"})`
      );
    if (it.downgraded)
      L.push("- **Note:** the model marked it as included, but the quote could not be verified.");
    L.push("");
  });
  if (a.gaps.length) {
    L.push("## What still needs clarifying", "", ...a.gaps.map((g) => `- ${g}`), "");
  }
  L.push("## Agreed scope", "");
  const sec = (t: string, xs: string[]) =>
    xs.length ? [`**${t}**`, ...xs.map((x) => `- ${x}`), ""] : [];
  L.push(
    ...sec("Deliverables", project.deliverables),
    ...sec("Features", project.features),
    ...sec("Exclusions", project.exclusions)
  );
  const entries = Object.entries(replies) as [Approach, NonNullable<Replies[Approach]>][];
  if (entries.length) {
    L.push("## Generated replies", "");
    entries.forEach(([ap, r]) => {
      L.push(`### ${approachLabel[ap]}`, "", `**Subject:** ${r.subject}`, "", r.body, "");
    });
  }
  return L.join("\n");
}

export function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slug(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "project"
  );
}
