"use client";

import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import SceneSummaryCard from "./scene-summary-card";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { useState } from "react";
import { useScripts } from "@/hooks/useScripts";
import { ViewToggle } from "./view-toggle";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ScenesTable } from "./scenes-table";

const ITEMS_PER_PAGE = 25;

const ScenesTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name" | "number">(
    (searchParams.get("sortBy") as "name" | "number") || "number"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
  );

  const { useGetScriptEntities } = useScripts();
  const result = useGetScriptEntities(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2]
  );

  const updateUrlWithSort = (
    newSortBy: "name" | "number",
    newSortOrder: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!result) {
    return <EntityScreenSkeleton />;
  }

  const { scenes, nextCursor, total } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("scenesTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("stats.scenesTotal", { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("createNew")}
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <ScenesTable
          data={scenes}
          totalPages={totalPages}
          page={page}
          cursors={cursors}
          nextCursor={nextCursor}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
            setCursors([]);
            updateUrlWithSort(newSortBy, newSortOrder);
          }}
          onPageChange={(newPage, newCursors) => {
            setPage(newPage);
            setCursors(newCursors);
          }}
        />
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {scenes.map((scene) => (
              <SceneSummaryCard
                key={scene._id}
                scene={scene}
                scriptId={scriptId}
              />
            ))}
          </div>
          <CursorPagination
            state={{
              page,
              cursors,
              totalPages,
              nextCursor,
            }}
            onPageChange={(newPage, newCursors) => {
              setPage(newPage);
              setCursors(newCursors);
            }}
          />
        </ScrollArea>
      )}
    </div>
  );
};

export default ScenesTabContent;
