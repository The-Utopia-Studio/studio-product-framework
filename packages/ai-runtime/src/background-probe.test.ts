/**
 * Background agent pattern probe — HORIZON-2 suspend/resume from the event log.
 * Also exposed as `pnpm probe:background` (runs this file via vitest).
 */
import { describe, expect, it } from "vitest";
import {
  resumeDurableLoop,
  startDurableLoop,
  type DurableStepResult,
} from "./durable-loop";
import { createInMemoryEventLog } from "./in-memory-event-log";

type ProbeState = {
  phase: "init" | "researching" | "awaiting_review" | "published";
  findings: string[];
};

const backgroundStep = async ({
  state,
  resumeData,
}: {
  state: ProbeState;
  resumeData?: Record<string, unknown>;
}): Promise<DurableStepResult<ProbeState>> => {
  switch (state.phase) {
    case "init":
      return {
        status: "continue",
        state: { phase: "researching", findings: ["source-a"] },
      };
    case "researching":
      return {
        status: "suspend",
        state: {
          phase: "awaiting_review",
          findings: [...state.findings, "source-b"],
        },
        suspendReason: "Review findings before publish",
        suspendPayload: { findings: [...state.findings, "source-b"] },
      };
    case "awaiting_review":
      if (resumeData?.approved !== true) {
        return {
          status: "fail",
          state,
          errorMessage: "Human rejected publish",
        };
      }
      return {
        status: "complete",
        state: { phase: "published", findings: state.findings },
        summary: "published",
      };
    case "published":
      return { status: "complete", state, summary: "already published" };
    default: {
      const _exhaustive: never = state.phase;
      return { status: "fail", state, errorMessage: `Unknown phase: ${_exhaustive}` };
    }
  }
};

describe("probe:background", () => {
  it("suspends then resumes from the event log alone", async () => {
    const log = createInMemoryEventLog();
    const budget = { maxTurns: 10, maxSpendCredits: 50 };

    const started = await startDurableLoop({
      runId: "probe-bg-1",
      userId: "probe-user",
      agentSlug: "background-probe",
      goal: "research then publish",
      initialState: { phase: "init", findings: [] },
      step: backgroundStep,
      eventLog: log,
      budget,
    });

    expect(started.ok).toBe(true);
    if (!started.ok) return;
    expect(started.value.status).toBe("awaiting_human");

    const events = await log.listEvents("probe-bg-1");
    const resumed = await resumeDurableLoop<ProbeState>({
      runId: "probe-bg-1",
      eventLog: log,
      events,
      step: backgroundStep,
      budget,
      resumeData: { approved: true },
    });

    expect(resumed.ok).toBe(true);
    if (!resumed.ok) return;
    expect(resumed.value.status).toBe("succeeded");
    expect(resumed.value.state.phase).toBe("published");
  });
});
