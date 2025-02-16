import { useScripts } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import SceneSummaryCard from "./scene-summary-card";
import { Skeleton } from "@/components/ui/skeleton";

const ScriptSceneEntitiesScreen = ({
  scriptId,
}: {
  scriptId: Id<"scripts">;
}) => {
  const { getScriptEntities } = useScripts();
  const entities = getScriptEntities(scriptId);

  if (!entities) {
    return <EntityScreenSkeleton />;
  }

  return (
    <div className="flex flex-col w-full bg-background flex-1 p-6 gap-6">
      {/* Script Header */}

      {/* Main Content */}
      <Tabs defaultValue="scenes" className="flex-1">
        <TabsList>
          <TabsTrigger value="scenes">Scenes Overview</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
        </TabsList>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="flex-1">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {entities.scenes.map((scene) => (
                <SceneSummaryCard key={scene._id} scene={scene} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
      </Tabs>
    </div>
  );
};

const EntityScreenSkeleton = () => (
  <div className="flex flex-col w-full bg-background flex-1 p-6 gap-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-10 w-full" />
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

export default ScriptSceneEntitiesScreen;
