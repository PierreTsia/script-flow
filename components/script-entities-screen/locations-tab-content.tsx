import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Sun, Moon, Clapperboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "@/components/script-entities-screen/entity-screen-skeleton";

const LocationsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetLocationsByScriptId } = useScene(scriptId);
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
              <Card key={location._id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{location.name}</h4>
                    {location.time_of_day === "DAY" ? (
                      <Sun className="h-4 w-4" />
                    ) : location.time_of_day === "NIGHT" ? (
                      <Moon className="h-4 w-4" />
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {location.scenes?.map((scene) => (
                      <TooltipProvider key={scene._id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              <Clapperboard className="h-3 w-3 mr-1" />
                              {scene.scene_number}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{scene.summary}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default LocationsTabContent;
