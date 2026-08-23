"use client";

import { useAuth } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Button } from "@utopia-studio-design/design-system/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@utopia-studio-design/design-system/Card";
import { api } from "../../convex/_generated/api";
import { HeroHeader } from "@/components/header";

type PlanPrice = { id: string; amount: number; interval?: string };
type PlanItem = {
  id: string;
  name: string;
  description?: string;
  isRecurring?: boolean;
  prices: PlanPrice[];
};

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [plans, setPlans] = useState<{ items: PlanItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPlans = useAction(api.subscriptions.getAvailablePlans);
  const subscriptionStatus = useQuery(
    api.subscriptions.checkUserSubscriptionStatus,
    isSignedIn ? {} : "skip",
  );
  const userSubscription = useQuery(api.subscriptions.fetchUserSubscription);
  const createCheckout = useAction(api.subscriptions.createCheckoutSession);
  const createPortalUrl = useAction(api.subscriptions.createCustomerPortalUrl);
  const upsertUser = useMutation(api.users.upsertUser);

  React.useEffect(() => {
    if (isSignedIn) {
      upsertUser().catch(console.error);
    }
  }, [isSignedIn, upsertUser]);

  React.useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getPlans();
        setPlans(result as { items: PlanItem[] });
      } catch (err) {
        console.error("Failed to load plans:", err);
        setError("Failed to load pricing plans. Please try again.");
      }
    };
    void loadPlans();
  }, [getPlans]);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }

    setLoadingPriceId(priceId);
    setError(null);

    try {
      await upsertUser();

      if (
        userSubscription?.status === "active" &&
        userSubscription?.customerId
      ) {
        const portalResult = await createPortalUrl({
          customerId: userSubscription.customerId,
        });
        window.open(portalResult.url, "_blank");
        setLoadingPriceId(null);
        return;
      }

      const checkoutUrl = await createCheckout({ priceId });
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process request. Please try again.";
      setError(errorMessage);
      setLoadingPriceId(null);
    }
  };

  const headerLoaderData = {
    isSignedIn: !!isSignedIn,
    hasActiveSubscription: !!subscriptionStatus?.hasActiveSubscription,
  };

  if (!plans) {
    return (
      <>
        <HeroHeader loaderData={headerLoaderData} />
        <section className="py-16 md:py-32">
          <div className="mx-auto max-w-6xl px-6 flex items-center justify-center gap-2 min-h-[40vh]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading plans...</span>
          </div>
          {error && <p className="text-destructive text-center">{error}</p>}
        </section>
      </>
    );
  }

  const hasUnlistedSubscription =
    userSubscription &&
    !plans.items.some((plan) =>
      plan.prices.some((p) => p.id === userSubscription.polarPriceId),
    );

  return (
    <>
      <HeroHeader loaderData={headerLoaderData} />
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-4xl font-semibold lg:text-5xl">
              Simple, transparent pricing
            </h1>
            <p>Choose the plan that fits your needs.</p>
            {isSignedIn && !subscriptionStatus?.hasActiveSubscription && (
              <div className="bg-primary/5 border-primary/20 rounded-lg border p-4 text-left sm:text-center">
                <p className="text-primary font-medium">Complete your setup</p>
                <p className="text-muted-foreground text-sm mt-1">
                  You&apos;re signed in! Choose a plan below to access your dashboard.
                </p>
              </div>
            )}
          </div>

          {plans.items.length === 0 ? (
            <div className="mt-8 max-w-md mx-auto text-center bg-muted/50 border rounded-lg p-6">
              <p className="font-medium">No plans configured yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Add products in your{" "}
                <a
                  href="https://polar.sh/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Polar dashboard
                </a>
                , or re-run the setup wizard&apos;s Billing — Polar step to
                create the default Starter/Pro/Scale plans.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
              {plans.items
                .slice()
                .sort((a, b) => {
                  const priceComparison = a.prices[0].amount - b.prices[0].amount;
                  return priceComparison !== 0
                    ? priceComparison
                    : a.name.localeCompare(b.name);
                })
                .map((plan, index) => {
                  const isPopular =
                    plans.items.length === 2
                      ? index === 1
                      : index === Math.floor(plans.items.length / 2);
                  const price = plan.prices[0];
                  const isCurrentPlan =
                    userSubscription?.status === "active" &&
                    userSubscription?.amount === price.amount;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative ${isPopular ? "border-primary" : ""}`}
                    >
                      {isPopular && !isCurrentPlan && (
                        <span className="bg-primary text-primary-foreground absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium">
                          Most Popular
                        </span>
                      )}
                      {isCurrentPlan && (
                        <span className="bg-primary text-primary-foreground absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium">
                          Current Plan
                        </span>
                      )}

                      <CardHeader>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            ${(price.amount / 100).toFixed(0)}
                          </span>
                          <span className="text-muted-foreground">
                            /{price.interval || "month"}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <hr className="border-dashed" />
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="size-4 text-primary" />
                            All features included
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="size-4 text-primary" />
                            Priority support
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="size-4 text-primary" />
                            Cancel anytime
                          </li>
                          {plan.isRecurring && (
                            <li className="flex items-center gap-2">
                              <Check className="size-4 text-primary" />
                              Recurring billing
                            </li>
                          )}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => handleSubscribe(price.id)}
                          disabled={loadingPriceId === price.id}
                          variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                        >
                          {loadingPriceId === price.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Setting up checkout...
                            </>
                          ) : isCurrentPlan ? (
                            "✓ Current Plan"
                          ) : userSubscription?.status === "active" ? (
                            (() => {
                              const currentAmount = userSubscription.amount || 0;
                              const newAmount = price.amount;
                              if (newAmount > currentAmount) {
                                return `Upgrade (+$${((newAmount - currentAmount) / 100).toFixed(0)}/mo)`;
                              }
                              if (newAmount < currentAmount) {
                                return `Downgrade (-$${((currentAmount - newAmount) / 100).toFixed(0)}/mo)`;
                              }
                              return "Manage Plan";
                            })()
                          ) : (
                            "Get Started"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-md max-w-md mx-auto">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {hasUnlistedSubscription && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md max-w-md mx-auto">
              <p className="text-amber-800 text-center text-sm">
                You have an active subscription that&apos;s not shown above.
                Contact support for assistance.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
