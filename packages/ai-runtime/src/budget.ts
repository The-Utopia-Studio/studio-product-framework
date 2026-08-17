import { err, ok, studioError, type Result, type StudioError } from "@studio/core";

/**
 * No agent run may execute without an explicit, finite cap on turns and
 * spend. There is no default cap — a caller must state one — so a runaway
 * loop can't rack up unbounded inference cost or unbounded compute by
 * omission.
 *
 * Whoever builds the multi-turn execution loop on top of this package
 * must call `assertWithinBudget` before every turn and stop the run the
 * first time it fails.
 */
export type AgentBudget = {
  readonly maxTurns: number;
  readonly maxSpendCredits: number;
};

export type AgentBudgetUsage = {
  readonly turnsUsed: number;
  readonly creditsSpent: number;
};

export function assertWithinBudget(
  budget: AgentBudget,
  usage: AgentBudgetUsage,
): Result<{ turnsRemaining: number; creditsRemaining: number }, StudioError> {
  if (!Number.isFinite(budget.maxTurns) || budget.maxTurns <= 0) {
    return err(
      studioError("VALIDATION", "maxTurns must be a positive finite number", {
        retryable: false,
      }),
    );
  }
  if (!Number.isFinite(budget.maxSpendCredits) || budget.maxSpendCredits <= 0) {
    return err(
      studioError(
        "VALIDATION",
        "maxSpendCredits must be a positive finite number",
        { retryable: false },
      ),
    );
  }
  if (usage.turnsUsed >= budget.maxTurns) {
    return err(
      studioError(
        "VALIDATION",
        `Agent run exceeded its turn budget (${budget.maxTurns})`,
        { retryable: false },
      ),
    );
  }
  if (usage.creditsSpent >= budget.maxSpendCredits) {
    return err(
      studioError(
        "BILLING",
        `Agent run exceeded its spend budget (${budget.maxSpendCredits} credits)`,
        { retryable: false },
      ),
    );
  }
  return ok({
    turnsRemaining: budget.maxTurns - usage.turnsUsed,
    creditsRemaining: budget.maxSpendCredits - usage.creditsSpent,
  });
}
