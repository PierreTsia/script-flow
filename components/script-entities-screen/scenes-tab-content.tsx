import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import SceneSummaryCard from "./scene-summary-card";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { useState } from "react";
import { useScripts } from "@/hooks/useScripts";

const ITEMS_PER_PAGE = 6;

const ScenesTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);

  const { useGetScriptEntities } = useScripts();
  const result = useGetScriptEntities(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2]
  );

  if (!result) {
    return <EntityScreenSkeleton />;
  }

  const { scenes, nextCursor, total } = result;

  console.log("Total scenes", total);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
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
      </ScrollArea>

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
    </div>
  );
};

export default ScenesTabContent;
