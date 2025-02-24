"use client";

import { SidebarIcon } from "lucide-react";
import { usePathname, useParams } from "next/navigation";
import React from "react";
import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { useSearchEntities } from "@/hooks/useSearchEntities";
import { Id } from "@/convex/_generated/dataModel";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const params = useParams<{ scriptId: string }>();

  // Initialize search hook
  const search = useSearchEntities(params.scriptId as Id<"scripts">);

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
              <Link href="/">Home</Link>
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
                    <Link href={crumb.href}>{crumb.text}</Link>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm
          className="w-full sm:ml-auto sm:w-auto"
          onSearch={search.handleSearch}
          searchTerm={search.searchTerm}
          results={search.results}
          isLoading={search.isLoading}
        />
      </div>
    </header>
  );
}
