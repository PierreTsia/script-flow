"use client";

import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import LocationSummaryCard from "./location-summary-card";
import CreateNewLocationDialog from "./create-new-location-dialog";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { ViewToggle } from "./view-toggle";
import { LocationsTable } from "./locations-table";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const ITEMS_PER_PAGE = 25;

const LocationsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name" | "scenesCount" | "type">(
    (searchParams.get("sortBy") as "name" | "scenesCount" | "type") || "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
  );

  const { useGetLocationsByScriptId } = useScene();
  const result = useGetLocationsByScriptId(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2],
    sortBy,
    sortOrder
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const updateUrlWithSort = (
    newSortBy: "name" | "scenesCount" | "type",
    newSortOrder: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!result) return <EntityScreenSkeleton />;

  const { locations, nextCursor, total } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("locationsTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("stats.locationsTotal", { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("createNew")}
          </Button>
        </div>
      </div>

      <CreateNewLocationDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {view === "table" ? (
        <LocationsTable
          data={locations}
          total={total}
          totalPages={totalPages}
          page={page}
          cursors={cursors}
          nextCursor={nextCursor}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(
            newSortBy: "name" | "scenesCount" | "type",
            newSortOrder: "asc" | "desc"
          ) => {
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
          {/* Group by INT/EXT */}
          {["INT", "EXT"].map((type) => {
            const locs = locations.filter((loc) => loc.type === type);
            return (
              <div key={type} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {type === "INT"
                    ? t("locationType.interior")
                    : t("locationType.exterior")}
                  <Badge variant="secondary">{locs.length}</Badge>
                </h3>
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {locs.map((location) => (
                    <LocationSummaryCard
                      key={location._id}
                      location={location}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <CursorPagination
            state={{
              page,
              cursors,
              totalPages,
              nextCursor: nextCursor ?? undefined,
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

export default LocationsTabContent;
