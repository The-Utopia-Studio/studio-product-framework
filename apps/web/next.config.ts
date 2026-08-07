import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@studio/core",
    "@studio/auth",
    "@studio/billing",
    "@studio/effect-critical",
    "@studio/ai-runtime",
    "@studio/observability",
    "@studio/email",
    "@studio/storage",
    "@studio/flags",
    "@studio/ratelimit",
  ],
};

export default nextConfig;
