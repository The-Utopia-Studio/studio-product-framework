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
        <section className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading plans...</span>
          </div>
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        </section>
      </>
    );
  }

  return (
    <>
      <HeroHeader loaderData={headerLoaderData} />
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-24">
        <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your needs
        </p>
        {isSignedIn && !subscriptionStatus?.hasActiveSubscription && (
          <div className="bg-primary/5 border-primary/20 mt-6 max-w-md mx-auto rounded-lg border p-4">
            <p className="text-primary font-medium">Complete your setup</p>
            <p className="text-muted-foreground text-sm mt-1">
              You&apos;re signed in! Choose a plan below to access your dashboard.
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
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
                className={`relative h-fit ${
                  isPopular ? "border-primary" : ""
                } ${isCurrentPlan ? "border-green-500 bg-green-50/50" : ""}`}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>All features included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(price.id)}
                    disabled={loadingPriceId === price.id}
                    variant={isCurrentPlan ? "secondary" : "default"}
                  >
                    {loadingPriceId === price.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up checkout...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      )}
      </section>
    </>
  );
}
