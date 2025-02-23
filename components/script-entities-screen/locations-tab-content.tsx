import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import LocationSummaryCard from "./location-summary-card";
import CreateNewLocationDialog from "./create-new-location-dialog";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";

const ITEMS_PER_PAGE = 12;

const LocationsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const { useGetLocationsByScriptId } = useScene();

  const result = useGetLocationsByScriptId(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2]
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!result) return <EntityScreenSkeleton />;

  const { locations, nextCursor, total } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Group by INT/EXT
  const groupedLocations = {
    INT: locations.filter((loc) => loc.type === "INT"),
    EXT: locations.filter((loc) => loc.type === "EXT"),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("locationsTitle")}</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("createNew")}
        </Button>
      </div>

      <CreateNewLocationDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ScrollArea className="h-[calc(100vh-220px)]">
        {Object.entries(groupedLocations).map(([type, locs]) => (
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
                <LocationSummaryCard key={location._id} location={location} />
              ))}
            </div>
          </div>
        ))}
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

export default LocationsTabContent;
