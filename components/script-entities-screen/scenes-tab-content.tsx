import { ScrollArea } from "@/components/ui/scroll-area";
import SceneSummaryCard from "./scene-summary-card";
import { Id } from "@/convex/_generated/dataModel";
import { useScripts } from "@/hooks/useScripts";
import EntityScreenSkeleton from "./entity-screen-skeleton";

const ScenesTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const { useGetScriptEntities } = useScripts();
  const scenes = useGetScriptEntities(scriptId)?.scenes;

  if (!scenes) {
    return <EntityScreenSkeleton />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {scenes.map((scene) => (
          <SceneSummaryCard key={scene._id} scene={scene} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ScenesTabContent;
