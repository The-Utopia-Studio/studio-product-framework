"use client";

import { IconDashboard, IconSettings } from "@tabler/icons-react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navSecondary = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
];

type SidebarUser = {
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: { emailAddress: string }[];
};

export function AppSidebar({
  variant,
  user,
  hasChat,
}: {
  variant: "sidebar" | "floating" | "inset";
  user: SidebarUser;
  hasChat: boolean;
}) {
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    // Only a real feature once OPENROUTER_API_KEY is configured — Convex's
    // runMeteredInference throws without it, so linking to it otherwise
    // would just be a dead end.
    ...(hasChat
      ? [{ title: "Chat", url: "/dashboard/chat", icon: MessageCircle }]
      : []),
  ];

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <span className="text-base font-semibold">Ras Mic Inc.</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
