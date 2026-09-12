import { describe, expect, it } from "vitest";
import {
  resumeDurableLoop,
  startDurableLoop,
  type DurableStepResult,
} from "./durable-loop";
import { createInMemoryEventLog } from "./in-memory-event-log";

type TestState = { count: number; approved?: boolean };

describe("durable-loop", () => {
  it("completes a multi-iteration loop and writes events", async () => {
    const log = createInMemoryEventLog();
    const step = async ({
      state,
    }: {
      state: TestState;
    }): Promise<DurableStepResult<TestState>> => {
      if (state.count >= 3) {
        return { status: "complete", state, summary: "done" };
      }
      return { status: "continue", state: { count: state.count + 1 } };
    };

    const result = await startDurableLoop({
      runId: "run-1",
      userId: "u1",
      agentSlug: "tester",
      goal: "count to three",
      initialState: { count: 0 },
      step,
      eventLog: log,
      budget: { maxTurns: 10, maxSpendCredits: 100 },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("succeeded");
      expect(result.value.state.count).toBe(3);
    }

    const events = await log.listEvents("run-1");
    expect(events.some((e) => e.kind === "run_started")).toBe(true);
    expect(events.some((e) => e.kind === "run_finished")).toBe(true);
    expect(events.filter((e) => e.kind === "stage_entered").length).toBeGreaterThanOrEqual(3);
  });

  it("suspends on human gate and resumes from event log alone", async () => {
    const log = createInMemoryEventLog();
    let callCount = 0;

    const step = async ({
      state,
      resumeData,
    }: {
      state: TestState;
      resumeData?: Record<string, unknown>;
    }): Promise<DurableStepResult<TestState>> => {
      callCount += 1;
      if (callCount === 1) {
        return {
          status: "suspend",
          state: { count: 1 },
          suspendReason: "Approve write?",
          suspendPayload: { target: "file.txt" },
        };
      }
      if (resumeData?.decision === "approved") {
        return { status: "complete", state: { ...state, approved: true } };
      }
      return { status: "continue", state };
    };

    const started = await startDurableLoop({
      runId: "run-2",
      userId: "u1",
      agentSlug: "tester",
      goal: "gated write",
      initialState: { count: 0 },
      step,
      eventLog: log,
      budget: { maxTurns: 10, maxSpendCredits: 100 },
    });

    expect(started.ok).toBe(true);
    if (started.ok) {
      expect(started.value.status).toBe("awaiting_human");
    }
    expect((await log.getRun("run-2"))?.status).toBe("awaiting_human");

    // Accidental resume without a decision must not advance the gate.
    const events = await log.listEvents("run-2");
    const refused = await resumeDurableLoop<TestState>({
      runId: "run-2",
      eventLog: log,
      events,
      step,
      budget: { maxTurns: 10, maxSpendCredits: 100 },
    });
    expect(refused.ok).toBe(false);

    // Fresh "process": only runId + events from the log.
    const resumed = await resumeDurableLoop<TestState>({
      runId: "run-2",
      eventLog: log,
      events,
      step,
      budget: { maxTurns: 10, maxSpendCredits: 100 },
      resumeData: { decision: "approved" },
    });

    expect(resumed.ok).toBe(true);
    if (resumed.ok) {
      expect(resumed.value.status).toBe("succeeded");
      expect(resumed.value.state.approved).toBe(true);
    }
    const after = await log.listEvents("run-2");
    expect(after.some((e) => e.kind === "human_gate_resolved")).toBe(true);
  });

  it("detects stall and fails after maxStallIterations", async () => {
    const log = createInMemoryEventLog();
    const step = async ({
      state,
    }: {
      state: TestState;
    }): Promise<DurableStepResult<TestState>> => ({
      status: "continue",
      state,
    });

    const result = await startDurableLoop({
      runId: "run-3",
      userId: "u1",
      agentSlug: "tester",
      goal: "stall",
      initialState: { count: 0 },
      step,
      eventLog: log,
      budget: { maxTurns: 20, maxSpendCredits: 100 },
      maxStallIterations: 2,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("failed");
      expect(result.value.summary).toContain("Stalled");
    }
  });

  it("respects budget ceiling", async () => {
    const log = createInMemoryEventLog();
    const step = async ({
      state,
    }: {
      state: TestState;
    }): Promise<DurableStepResult<TestState>> => ({
      status: "continue",
      state: { count: state.count + 1 },
    });

    const result = await startDurableLoop({
      runId: "run-4",
      userId: "u1",
      agentSlug: "tester",
      goal: "budget",
      initialState: { count: 0 },
      step,
      eventLog: log,
      budget: { maxTurns: 2, maxSpendCredits: 100 },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("failed");
      expect(result.value.errorMessage?.toLowerCase()).toMatch(/budget|turn/);
    }
  });
});
