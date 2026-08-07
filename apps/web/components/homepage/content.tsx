import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ContentSection() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-medium">
            The framework AI-native teams actually ship on.
          </h2>
          <div className="space-y-6">
            <p>
              Stop rebuilding auth, billing, agents, and observability for every
              product. Studio Product Framework gives you composable
              capabilities on Convex — with an Effect fence for money and
              inference, plus builder-agent skills and review loops.
            </p>
            <p>
              <span className="font-bold">Compose, don&apos;t fork.</span>{" "}
              Apps orchestrate domain rules; packages own reusable mechanics.
              PostHog, Sentry, Rams, and Greptile are first-class so quality
              stays engineered as you move fast.
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="gap-1 pr-1.5"
            >
              <Link href="#">
                <span>Learn More</span>
                <ChevronRight className="size-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
