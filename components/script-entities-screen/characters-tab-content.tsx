import { ScrollArea } from "@/components/ui/scroll-area";
import SceneSummaryCard from "./scene-summary-card";
import { ScriptEntitiesResult } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { useScripts } from "@/hooks/useScripts";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import { useScene } from "@/hooks/useScene";

const CharactersTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const { getCharactersByScriptId } = useScene(scriptId);
  const characters = getCharactersByScriptId(scriptId);
  console.log(characters);

  if (!characters) {
    return <EntityScreenSkeleton />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {characters.map((character) => (
          <div key={character._id}>
            <h2>{character.name}</h2>
            <p>{character.type}</p>
            <p>{character.notes}</p>
            <div>
              {character.scenes.map((scene) => (
                <div key={scene._id}>
                  <p>{scene.scene_number}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CharactersTabContent;
