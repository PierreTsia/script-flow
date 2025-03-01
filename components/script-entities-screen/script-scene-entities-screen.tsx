"use client";

import { useScripts } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsPageMenu } from "./tabs-page-menu";
import { usePathname, useRouter } from "next/navigation";
import ScriptTopBar from "../script-top-bar";
import { useAuth } from "@clerk/nextjs";

const ScriptSceneEntitiesScreen = ({
  scriptId,
  children,
}: {
  scriptId: Id<"scripts">;
  children: React.ReactNode;
}) => {
  const { isLoaded: authLoaded } = useAuth();
  const { useGetScriptEntities } = useScripts();
  const entities = useGetScriptEntities(scriptId, 6);
  const pathname = usePathname();
  const router = useRouter();

  const currentTab = pathname.split("/").pop() as
    | "characters"
    | "locations"
    | "props"
    | "scenes"
    | undefined;

  if (!authLoaded || !entities) {
    return <EntityScreenSkeleton />;
  }

  const handleTabChange = (tab: string) => {
    const sortBy = tab === "scenes" ? "scene_number" : "name";
    router.push(
      `/scripts/${scriptId}/entities/${tab}?sortBy=${sortBy}&sortOrder=desc`
    );
  };

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
        <TabsPageMenu
          currentTab={currentTab || "scenes"}
          setCurrentTab={handleTabChange}
        >
          {children}
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
