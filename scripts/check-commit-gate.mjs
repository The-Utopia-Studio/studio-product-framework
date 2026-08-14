#!/usr/bin/env node
// Technical enforcement for agents/loops/commit-v1.md ("Icarus" commit gate).
// Run locally before bootstrapping a venture product, or in CI whenever a
// PR touches agents/context/discovery/*.
//
// A PR can legitimately edit the *template's* structure (add a row, fix a
// link) without attempting a venture commit — see
// agents/context/discovery/README.md's own "platform plumbing" note. So
// this only enforces the pass bar once someone has actually started
// filling a template in (a score, a sign-off, a checked box); a still-
// pristine blank template is not a commit attempt and is skipped.
//
// This does not replace human judgment — it only makes the documented
// pass bar (score >= 32, evidence signed, spec signed) something that can
// actually block a commit instead of being an honor-system checklist.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const discoveryDir = path.join(repoRoot, "agents", "context", "discovery");

function readDoc(name) {
  return readFileSync(path.join(discoveryDir, name), "utf8");
}

function isBlank(value) {
  return !value || /^_+$/.test(value.trim());
}

function parseProblemScorecard(text) {
  const totalMatch = text.match(/\*\*Total\*\*\s*\|\s*\*?\*?(\d+)/);
  const signOffMatch = text.match(/Human sign-off:\s*(.*)/);
  return {
    total: totalMatch ? Number(totalMatch[1]) : null,
    signOff: signOffMatch?.[1],
    filled: !isBlank(totalMatch?.[1]) || !isBlank(signOffMatch?.[1]),
  };
}

function parseEvalFirstSpec(text) {
  const checklistSection = text.split("## Commit checklist")[1] ?? "";
  const checkedItems = [...checklistSection.matchAll(/^- \[x\] /gim)];
  const uncheckedItems = [
    ...checklistSection.matchAll(/^- \[ \] (.+)$/gm),
  ].map((m) => m[1]);
  const signOffMatch = text.match(/Human sign-off \(commit line\):\s*(.*)/);
  return {
    uncheckedItems,
    signOff: signOffMatch?.[1],
    filled: checkedItems.length > 0 || !isBlank(signOffMatch?.[1]),
  };
}

function parseEvidenceLadder(text) {
  const signOffMatch = text.match(/Human sign-off:\s*(.*)/);
  return {
    signOff: signOffMatch?.[1],
    filled: !isBlank(signOffMatch?.[1]),
  };
}

if (process.env.SKIP_COMMIT_GATE === "1") {
  console.log(
    "SKIP_COMMIT_GATE=1 set — skipping the Icarus commit gate check. This must be a deliberate, documented human override.",
  );
  process.exit(0);
}

const scorecard = parseProblemScorecard(readDoc("problem-scorecard.md"));
const spec = parseEvalFirstSpec(readDoc("eval-first-spec.md"));
const evidence = parseEvidenceLadder(readDoc("evidence-ladder.md"));

if (!scorecard.filled && !spec.filled && !evidence.filled) {
  console.log(
    "Icarus commit gate: SKIPPED — discovery templates are untouched (no score, sign-off, or checklist item filled in). Nothing to gate; this looks like platform plumbing, not a venture commit attempt.",
  );
  process.exit(0);
}

const failures = [];

if (scorecard.total === null) {
  failures.push(
    "problem-scorecard.md: could not find a filled-in Total score (expected a number in the Total row).",
  );
} else if (scorecard.total < 32) {
  failures.push(
    `problem-scorecard.md: Total score is ${scorecard.total}/40 — must be >= 32 to pass (28-31: redesign wedge, <28: kill). If a human is explicitly overriding, note it in agents/context/learnings.md and skip this check with SKIP_COMMIT_GATE=1.`,
  );
}
if (isBlank(scorecard.signOff)) {
  failures.push(
    "problem-scorecard.md: Human sign-off is blank — a human must sign before this commit gate passes; agents do not self-approve.",
  );
}

if (spec.uncheckedItems.length > 0) {
  failures.push(
    `eval-first-spec.md: commit checklist has unchecked items:\n${spec.uncheckedItems.map((item) => `    - ${item}`).join("\n")}`,
  );
}
if (isBlank(spec.signOff)) {
  failures.push(
    "eval-first-spec.md: Human sign-off (commit line) is blank — a human must sign before build starts.",
  );
}

if (isBlank(evidence.signOff)) {
  failures.push("evidence-ladder.md: Human sign-off is blank.");
}

if (failures.length > 0) {
  console.error("Icarus commit gate: BLOCKED\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(
    "\nSee agents/loops/commit-v1.md. This gate only applies to venture/customer-facing v1 scope, not platform plumbing.",
  );
  process.exit(1);
}

console.log(
  "Icarus commit gate: PASSED — scorecard, evidence, and spec are all signed.",
);
