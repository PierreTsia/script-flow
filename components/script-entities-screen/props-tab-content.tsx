import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clapperboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";

const PropsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetPropsByScriptId } = useScene();
  const props = useGetPropsByScriptId(scriptId);

  if (!props) return <EntityScreenSkeleton />;

  // Group props by usage frequency
  const groupedProps = {
    recurring: props.filter((prop) => prop.scenes.length > 1),
    oneOff: props.filter((prop) => prop.scenes.length <= 1),
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      {Object.entries(groupedProps).map(([group, items]) => (
        <div key={group} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t(`propsDetails.${group}`)}
            <Badge variant="secondary">{items.length}</Badge>
          </h3>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((prop) => (
              <Card key={prop._id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{prop.name}</h4>
                    <Badge>
                      {t("propsDetails.quantity", { count: prop.quantity })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {prop.scenes?.map((scene) => (
                      <TooltipProvider key={scene._id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline">
                              <Clapperboard className="h-3 w-3 mr-1" />
                              {scene.scene_number}
                            </Badge>
                          </TooltipTrigger>
                          {scene.notes && (
                            <TooltipContent>
                              <p className="max-w-xs">{scene.notes}</p>
                            </TooltipContent>
                          )}
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

export default PropsTabContent;
