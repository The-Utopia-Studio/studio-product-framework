"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@utopia-studio-design/design-system/Button";
import { HeroHeader } from "../header";
import { PRODUCT_NAME } from "@/lib/product";

const readyChecklist = ["Authentication", "Database", "Design system"];

export default function Hero({
  loaderData,
}: {
  loaderData?: { isSignedIn: boolean; hasActiveSubscription: boolean };
}) {
  const primaryHref = !loaderData?.isSignedIn
    ? "/sign-up"
    : loaderData.hasActiveSubscription
      ? "/dashboard"
      : "/pricing";
  const primaryText = !loaderData?.isSignedIn
    ? "Get started"
    : loaderData.hasActiveSubscription
      ? "Go to dashboard"
      : "Choose a plan";

  return (
    <section id="hero" className="bg-background relative overflow-hidden">
      <HeroHeader loaderData={loaderData} />
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-32 text-center md:pt-48 md:pb-44">
        <span className="text-primary text-xs font-semibold tracking-[0.08em] uppercase">
          Hello, world
        </span>
        <h1 className="mt-4 text-balance text-5xl leading-[0.95] font-semibold tracking-tight md:text-7xl">
          Welcome to {PRODUCT_NAME}
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
          Your stack is live — sign in, subscribe to a plan, and this
          homepage is yours to replace with the real thing.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href={primaryHref}>{primaryText}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>

        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {readyChecklist.map((item) => (
            <li
              key={item}
              className="text-muted-foreground flex items-center gap-2 text-sm"
            >
              <CheckCircle2 className="text-primary size-4" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Ceramic's "///" corner mark — see utopia-design-system.vercel.app */}
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="text-foreground pointer-events-none absolute top-8 right-8 size-8 opacity-90"
      >
        <path
          d="M10 0 L2 40 M22 0 L14 40 M34 0 L26 40"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
    </section>
  );
}
