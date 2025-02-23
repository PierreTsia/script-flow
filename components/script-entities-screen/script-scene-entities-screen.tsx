"use client";

import { useScripts } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsPageMenu } from "./tabs-page-menu";
import { useState } from "react";
import ScenesTabContent from "./scenes-tab-content";
import CharactersTabContent from "./characters-tab-content";
import LocationsTabContent from "./locations-tab-content";
import PropsTabContent from "./props-tab-content";
import { useAuth } from "@clerk/nextjs";
import ScriptTopBar from "../script-top-bar";
const ScriptSceneEntitiesScreen = ({
  scriptId,
}: {
  scriptId: Id<"scripts">;
}) => {
  const { isLoaded: authLoaded } = useAuth();
  const { useGetScriptEntities } = useScripts();
  const entities = useGetScriptEntities(scriptId, 6);

  const [currentTab, setCurrentTab] = useState<
    "scenes" | "characters" | "locations" | "props"
  >("scenes");

  if (!authLoaded || !entities) {
    return <EntityScreenSkeleton />;
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-[100vh]">
      <div className="sticky top-0 z-10 bg-background border-b">
        <ScriptTopBar
          scriptId={scriptId}
          name={entities.script.name}
          creationTime={entities.script._creationTime}
        />
      </div>
      <div className="flex-1 p-6 gap-6">
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
            <LocationsTabContent scriptId={scriptId} />
          </TabsContent>
          <TabsContent value="props" className="flex-1">
            <PropsTabContent scriptId={scriptId} />
          </TabsContent>
        </TabsPageMenu>
      </div>
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
