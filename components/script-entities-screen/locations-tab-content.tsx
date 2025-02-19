import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "@/components/script-entities-screen/entity-screen-skeleton";
import LocationSummaryCard from "./location-summary-card";

const LocationsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetLocationsByScriptId } = useScene();
  const locations = useGetLocationsByScriptId(scriptId);

  if (!locations) return <EntityScreenSkeleton />;

  // Group by INT/EXT
  const groupedLocations = {
    INT: locations.filter((loc) => loc.type === "INT"),
    EXT: locations.filter((loc) => loc.type === "EXT"),
  };

  return (
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
  );
};

export default LocationsTabContent;
