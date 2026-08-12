#!/usr/bin/env node
// Technical enforcement for agents/loops/commit-v1.md ("Icarus" commit gate).
// Run locally before bootstrapping a venture product, or in CI whenever a
// PR touches agents/context/discovery/*. Platform-only PRs never touch
// those files, so this never fires for framework plumbing work.
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

const failures = [];

function readDoc(name) {
  return readFileSync(path.join(discoveryDir, name), "utf8");
}

function isBlank(value) {
  return !value || /^_+$/.test(value.trim());
}

function checkProblemScorecard() {
  const text = readDoc("problem-scorecard.md");

  const totalMatch = text.match(/\*\*Total\*\*\s*\|\s*\*?\*?(\d+)/);
  const total = totalMatch ? Number(totalMatch[1]) : null;
  if (total === null) {
    failures.push(
      "problem-scorecard.md: could not find a filled-in Total score (expected a number in the Total row).",
    );
  } else if (total < 32) {
    failures.push(
      `problem-scorecard.md: Total score is ${total}/40 — must be >= 32 to pass (28-31: redesign wedge, <28: kill). If a human is explicitly overriding, note it in agents/context/learnings.md and skip this check with SKIP_COMMIT_GATE=1.`,
    );
  }

  const signOffMatch = text.match(/Human sign-off:\s*(.*)/);
  if (isBlank(signOffMatch?.[1])) {
    failures.push(
      "problem-scorecard.md: Human sign-off is blank — a human must sign before this commit gate passes; agents do not self-approve.",
    );
  }
}

function checkEvalFirstSpec() {
  const text = readDoc("eval-first-spec.md");

  const checklistSection = text.split("## Commit checklist")[1] ?? "";
  const uncheckedItems = [
    ...checklistSection.matchAll(/^- \[ \] (.+)$/gm),
  ].map((m) => m[1]);
  if (uncheckedItems.length > 0) {
    failures.push(
      `eval-first-spec.md: commit checklist has unchecked items:\n${uncheckedItems.map((item) => `    - ${item}`).join("\n")}`,
    );
  }

  const signOffMatch = text.match(/Human sign-off \(commit line\):\s*(.*)/);
  if (isBlank(signOffMatch?.[1])) {
    failures.push(
      "eval-first-spec.md: Human sign-off (commit line) is blank — a human must sign before build starts.",
    );
  }
}

function checkEvidenceLadder() {
  const text = readDoc("evidence-ladder.md");
  const signOffMatch = text.match(/Human sign-off:\s*(.*)/);
  if (isBlank(signOffMatch?.[1])) {
    failures.push("evidence-ladder.md: Human sign-off is blank.");
  }
}

if (process.env.SKIP_COMMIT_GATE === "1") {
  console.log(
    "SKIP_COMMIT_GATE=1 set — skipping the Icarus commit gate check. This must be a deliberate, documented human override.",
  );
  process.exit(0);
}

checkProblemScorecard();
checkEvalFirstSpec();
checkEvidenceLadder();

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

console.log("Icarus commit gate: PASSED — scorecard, evidence, and spec are all signed.");
