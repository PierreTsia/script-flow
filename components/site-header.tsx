"use client";

import { SidebarIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Create breadcrumb items from pathname
  const breadcrumbs =
    pathname
      ?.split("/")
      .filter(Boolean) // Remove empty strings
      .map((segment, index, array) => {
        // Build the href for this segment (accumulate previous segments)
        const href = `/${array.slice(0, index + 1).join("/")}`;
        // Format the segment text (capitalize and replace hyphens)
        const text =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
        return { text, href };
      }) || [];

  return (
    <header className="fle sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {/* Home is always first */}
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>

            {/* Map through the rest of the breadcrumbs */}
            {breadcrumbs.map((crumb, index) => (
              // Using index as key is fine here as the array is stable
              <React.Fragment key={crumb.href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    // Last item is current page
                    <BreadcrumbPage>{crumb.text}</BreadcrumbPage>
                  ) : (
                    // Other items are links
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.text}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
