import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import CharacterSummaryCard from "./character-summary-card";
import { CharactersWithScenes } from "@/convex/characters";

const CharactersTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const { getCharactersByScriptId } = useScene(scriptId);
  const characters = getCharactersByScriptId(scriptId);

  if (!characters) {
    return <EntityScreenSkeleton />;
  }

  // Sort characters by number of scenes (descending) and type (PRINCIPAL first)
  const sortedCharacters = [...characters].sort((a, b) => {
    if (a.type === "PRINCIPAL" && b.type !== "PRINCIPAL") return -1;
    if (a.type !== "PRINCIPAL" && b.type === "PRINCIPAL") return 1;
    return b.scenes.length - a.scenes.length;
  });

  const getPotentialDuplicates = (character: CharactersWithScenes[number]) => {
    return sortedCharacters.filter(
      (c) => c.type === character.type && c._id !== character._id
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {sortedCharacters.map((character) => (
          <CharacterSummaryCard
            key={character._id}
            character={character}
            potentialDuplicates={getPotentialDuplicates(character)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default CharactersTabContent;
