#!/usr/bin/env node
// Mechanical enforcement of the ship-bar checklist in
// .github/PULL_REQUEST_TEMPLATE.md. Reads the PR body from $PR_BODY and
// fails if any "Reviews" checkbox is unticked.
//
// Honesty note: this does NOT verify Rams/Greptile/Aikido actually ran —
// there is no live integration with those tools in this repo yet (see
// TUS-2635). It converts an ignorable checklist into a required assertion:
// a human must explicitly tick each box before merge, which is a real,
// if partial, improvement over a checklist nothing reads.

const body = process.env.PR_BODY ?? "";

if (!body.trim()) {
  console.error(
    "check-pr-checklist: PR_BODY is empty — can't verify the ship-bar checklist.",
  );
  process.exit(1);
}

const reviewsSection = body.split(/##\s*Reviews/i)[1]?.split(/\n##\s/)[0] ?? "";

if (!reviewsSection.trim()) {
  console.error(
    'check-pr-checklist: no "## Reviews" section found in the PR body — did this PR use .github/PULL_REQUEST_TEMPLATE.md?',
  );
  process.exit(1);
}

const uncheckedItems = [...reviewsSection.matchAll(/^- \[ \] (.+)$/gm)].map(
  (m) => m[1],
);

if (uncheckedItems.length > 0) {
  console.error("Ship-bar checklist: BLOCKED\n");
  console.error("Unticked items in the Reviews section:");
  for (const item of uncheckedItems) {
    console.error(`  - ${item}`);
  }
  console.error(
    "\nTick each box once addressed (or replace with risk notes per the template) before merging.",
  );
  process.exit(1);
}

console.log("Ship-bar checklist: all Reviews items ticked.");
