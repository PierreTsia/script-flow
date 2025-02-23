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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PaginationNumbers from "@/components/ui/pagination-numbers";

const ITEMS_PER_PAGE = 5; // Adjust as needed

type Prop = PropsWithScenes["props"][number];

type GroupedProps = {
  recurring: Prop[];
  oneOff: Prop[];
  unassigned: Prop[];
};

const PropsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const { useGetPropsByScriptId } = useScene();
  const result = useGetPropsByScriptId(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2]
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handlePageClick = (targetPage: number) => {
    if (targetPage > totalPages || targetPage < 1) {
      return;
    }

    if (targetPage === 1) {
      setPage(1);
      setCursors([]);
      return;
    }

    // For any forward navigation when we have nextCursor
    if (targetPage > page && nextCursor) {
      setCursors((prev) => [...prev, nextCursor]);
      setPage(targetPage);
      return;
    }

    // For backward navigation
    if (targetPage <= cursors.length + 1) {
      setPage(targetPage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("propsTitle")}</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("createNew")}
        </Button>
      </div>

      <CreateNewPropDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

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
      </ScrollArea>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (page > 1) {
                  setPage((p) => p - 1);
                }
              }}
              isActive={page !== 1}
            />
          </PaginationItem>

          <PaginationNumbers
            currentPage={page}
            totalPages={totalPages}
            onPageClick={handlePageClick}
          />

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (nextCursor) {
                  setCursors((prev) => [...prev, nextCursor]);
                  setPage((p) => p + 1);
                }
              }}
              isActive={!!nextCursor}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PropsTabContent;
