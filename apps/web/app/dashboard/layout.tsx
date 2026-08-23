import { auth, clerkClient } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api } from "../../convex/_generated/api";
import { getConvexToken } from "@/lib/convex-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const token = await getConvexToken();
  const [subscriptionStatus, user] = await Promise.all([
    fetchQuery(
      api.subscriptions.checkUserSubscriptionStatus,
      {},
      token ? { token } : undefined,
    ),
    (await clerkClient()).users.getUser(userId),
  ]);

  // Only gate on billing once Polar is actually configured — otherwise every
  // venture that hasn't set up billing yet locks itself out of its own
  // dashboard with no way to reach /pricing and no plans to buy there anyway.
  const billingConfigured = Boolean(
    process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_ORGANIZATION_ID,
  );
  if (billingConfigured && !subscriptionStatus?.hasActiveSubscription) {
    redirect("/subscription-required");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={user}
        hasChat={Boolean(process.env.OPENROUTER_API_KEY)}
      />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
