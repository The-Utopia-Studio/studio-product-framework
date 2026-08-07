export type StudioErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "BILLING"
  | "INFERENCE"
  | "DELIVERY"
  | "CONFIG"
  | "EXTERNAL"
  | "INTERNAL";

export type StudioError = {
  readonly code: StudioErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  readonly retryable?: boolean;
};

export function studioError(
  code: StudioErrorCode,
  message: string,
  options?: { cause?: unknown; retryable?: boolean },
): StudioError {
  return {
    code,
    message,
    cause: options?.cause,
    retryable: options?.retryable ?? false,
  };
}
