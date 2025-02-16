import { useScripts } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsPageMenu } from "./tabs-page-menu";
import SceneSummaryCard from "./scene-summary-card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState } from "react";
import ScenesTabContent from "./scenes-tab-content";
import CharactersTabContent from "./characters-tab-content";
const ScriptSceneEntitiesScreen = ({
  scriptId,
}: {
  scriptId: Id<"scripts">;
}) => {
  const { getScriptEntities } = useScripts();
  const entities = getScriptEntities(scriptId);

  const [currentTab, setCurrentTab] = useState<
    "scenes" | "characters" | "locations" | "props"
  >("scenes");

  if (!entities) {
    return <EntityScreenSkeleton />;
  }

  return (
    <div className="flex flex-col w-full bg-background flex-1 p-6 gap-6">
      {/* Script Header */}

      {/* Main Content */}
      <TabsPageMenu currentTab={currentTab} setCurrentTab={setCurrentTab}>
        {/* Scenes Tab */}
        <TabsContent value="scenes" className="flex-1">
          <ScenesTabContent scriptId={scriptId} />
        </TabsContent>
        {/* Other tabs would be implemented similarly */}
        <TabsContent value="characters" className="flex-1">
          <CharactersTabContent scriptId={scriptId} />
        </TabsContent>
        <TabsContent value="locations" className="flex-1">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              Locations
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="props" className="flex-1">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              Props
            </div>
          </ScrollArea>
        </TabsContent>
      </TabsPageMenu>
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
