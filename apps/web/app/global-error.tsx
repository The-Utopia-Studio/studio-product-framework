"use client";

import { useEffect } from "react";
import { captureAppException } from "@/components/observability-provider";

/**
 * App Router root error boundary. Without this, render errors are only
 * caught by Sentry's automatic unhandled-exception hook (if any) — this
 * makes handled render errors visible too.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureAppException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
          <h1 className="text-lg font-medium">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            The error has been reported. Try refreshing the page.
          </p>
        </div>
      </body>
    </html>
  );
}
