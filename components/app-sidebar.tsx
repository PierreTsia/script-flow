"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Scripts",
      url: "/scripts",
      icon: SquareTerminal, // Assuming this icon is appropriate for scripts
      isActive: true,
      items: [
        {
          title: "Upload Script",
          url: "/scripts/upload",
        },
        {
          title: "View Scripts",
          url: "/scripts",
        },
      ],
    },
    {
      title: "Models",
      url: "/models",
      icon: Bot,
      items: [
        {
          title: "AI Models Overview",
          url: "/models",
        },
        {
          title: "Genesis",
          url: "/models/genesis", // Example model ID
        },
        {
          title: "Explorer",
          url: "/models/explorer", // Example model ID
        },
        {
          title: "Quantum",
          url: "/models/quantum", // Example model ID
        },
      ],
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: BookOpen,
      items: [
        {
          title: "User Guides",
          url: "/documentation",
        },
        {
          title: "Get Started",
          url: "/documentation/get-started",
        },
        {
          title: "Tutorials",
          url: "/documentation/tutorials",
        },
        {
          title: "Saved Resources",
          url: "/documentation/saved",
        },
        {
          title: "Changelog",
          url: "/documentation/changelog",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General Settings",
          url: "/settings",
        },
        {
          title: "Analysis Settings",
          url: "/settings/analysis",
        },
        {
          title: "Team Settings",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Limits",
          url: "/settings/limits",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "/projects/design-engineering",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "/projects/sales-marketing",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "/projects/travel",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ScriptFlow AI</span>
                  <span className="truncate text-xs">
                    AI-powered script breakdown
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
