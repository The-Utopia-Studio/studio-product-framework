import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "../header";
import { PRODUCT_NAME } from "@/lib/product";

const readyChecklist = [
  "Authentication",
  "Database",
  "Design system",
];

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
    <section id="hero">
      <HeroHeader loaderData={loaderData} />
      <div className="bg-muted dark:bg-background py-32 md:py-44">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-primary text-sm font-medium tracking-wide uppercase">
            Hello, world
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold md:text-6xl">
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
      </div>
    </section>
  );
}
