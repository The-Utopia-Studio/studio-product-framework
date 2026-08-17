import { describe, expect, it } from "vitest";
import { assertWithinBudget } from "./budget";

describe("assertWithinBudget", () => {
  it("allows a run within its turn and spend budget", () => {
    const result = assertWithinBudget(
      { maxTurns: 10, maxSpendCredits: 100 },
      { turnsUsed: 3, creditsSpent: 20 },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.turnsRemaining).toBe(7);
      expect(result.value.creditsRemaining).toBe(80);
    }
  });

  it("rejects a run once it reaches its turn cap", () => {
    const result = assertWithinBudget(
      { maxTurns: 5, maxSpendCredits: 100 },
      { turnsUsed: 5, creditsSpent: 0 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION");
    }
  });

  it("rejects a run once it reaches its spend cap", () => {
    const result = assertWithinBudget(
      { maxTurns: 10, maxSpendCredits: 50 },
      { turnsUsed: 1, creditsSpent: 50 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("BILLING");
    }
  });

  it("rejects a non-positive or infinite budget instead of treating it as unbounded", () => {
    const zero = assertWithinBudget(
      { maxTurns: 0, maxSpendCredits: 100 },
      { turnsUsed: 0, creditsSpent: 0 },
    );
    expect(zero.ok).toBe(false);

    const infinite = assertWithinBudget(
      { maxTurns: Number.POSITIVE_INFINITY, maxSpendCredits: 100 },
      { turnsUsed: 0, creditsSpent: 0 },
    );
    expect(infinite.ok).toBe(false);
  });
});
