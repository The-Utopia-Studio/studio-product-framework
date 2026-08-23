import { auth } from "@clerk/nextjs/server";
import { fetchAction, fetchQuery } from "convex/nextjs";
import Footer from "@/components/homepage/footer";
import Hero from "@/components/homepage/hero";
import Pricing from "@/components/homepage/pricing";
import { api } from "../convex/_generated/api";
import { getConvexToken } from "@/lib/convex-server";

export default async function HomePage() {
  const { userId } = await auth();
  const token = await getConvexToken();

  const [subscriptionData, plans] = await Promise.all([
    userId && token
      ? fetchQuery(
          api.subscriptions.checkUserSubscriptionStatus,
          {},
          { token },
        ).catch(() => null)
      : Promise.resolve(null),
    fetchAction(api.subscriptions.getAvailablePlans),
  ]);

  const loaderData = {
    isSignedIn: !!userId,
    hasActiveSubscription: subscriptionData?.hasActiveSubscription || false,
    plans,
  };

  return (
    <>
      <Hero loaderData={loaderData} />
      <Pricing loaderData={loaderData} />
      <Footer />
    </>
  );
}
