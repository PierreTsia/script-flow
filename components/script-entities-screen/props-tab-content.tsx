"use client";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import PropSummaryCard from "./prop-summary-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateNewPropDialog from "./create-new-prop-dialog";
import { PropsWithScenes } from "@/convex/props";
import { ViewToggle } from "./view-toggle";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { PropsTable } from "./props-table";

const ITEMS_PER_PAGE = 25;

type Prop = PropsWithScenes["props"][number];

type GroupedProps = {
  recurring: Prop[];
  oneOff: Prop[];
  unassigned: Prop[];
};

const PropsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<"name" | "scenesCount">(
    (searchParams.get("sortBy") as "name" | "scenesCount") || "scenesCount"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  const { useGetPropsByScriptId } = useScene();
  const result = useGetPropsByScriptId(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2],
    sortBy,
    sortOrder
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const updateUrlWithSort = (
    newSortBy: "name" | "scenesCount",
    newSortOrder: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!result) return <EntityScreenSkeleton />;

  const { props: propsList, nextCursor, total } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const groupedProps = propsList?.reduce<GroupedProps>(
    (acc, prop) => {
      const scenesCount = prop.scenes?.length || 0;
      if (scenesCount > 1) {
        acc.recurring.push(prop);
      } else if (scenesCount === 1) {
        acc.oneOff.push(prop);
      } else {
        acc.unassigned.push(prop);
      }
      return acc;
    },
    {
      recurring: [],
      oneOff: [],
      unassigned: [],
    }
  );

  const paginationFooter = (
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
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("propsTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("stats.propsTotal", { count: result.total })}
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

      <CreateNewPropDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {view === "table" ? (
        <PropsTable
          data={result.props}
          totalPages={Math.ceil(result.total / ITEMS_PER_PAGE)}
          page={page}
          cursors={cursors}
          nextCursor={result.nextCursor}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(
            newSortBy: "name" | "scenesCount",
            newSortOrder: "asc" | "desc"
          ) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
            setCursors([]);
            updateUrlWithSort(newSortBy, newSortOrder);
          }}
          onPageChange={(newPage: number, newCursors: string[]) => {
            setPage(newPage);
            setCursors(newCursors);
          }}
        />
      ) : (
        <ScrollArea className="flex-1">
          {Object.entries(groupedProps).map(
            ([group, items]) =>
              items.length > 0 && (
                <div key={group} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t(`propsDetails.${group}`)}
                    <Badge variant="secondary">{items.length}</Badge>
                  </h3>
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {items.map((prop) => (
                      <PropSummaryCard key={prop._id} prop={prop} />
                    ))}
                  </div>
                </div>
              )
          )}
          {paginationFooter}
        </ScrollArea>
      )}
    </div>
  );
};

export default PropsTabContent;
