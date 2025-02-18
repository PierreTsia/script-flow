import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import CharacterSummaryCard from "./character-summary-card";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "@/components/ui/badge";
import { Star, Users, User } from "lucide-react";

const CharactersTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetCharactersByScriptId } = useScene(scriptId);
  const characters = useGetCharactersByScriptId(scriptId);

  if (!characters) {
    return <EntityScreenSkeleton />;
  }

  // Group characters by type
  const groupedCharacters = {
    PRINCIPAL: characters.filter((char) => char.type === "PRINCIPAL"),
    SECONDARY: characters.filter((char) => char.type === "SECONDARY"),
    others: characters.filter(
      (char) => !["PRINCIPAL", "SECONDARY"].includes(char.type)
    ),
  };

  // Sort each group by number of scenes
  Object.keys(groupedCharacters).forEach((key) => {
    groupedCharacters[key as keyof typeof groupedCharacters].sort(
      (a, b) => b.scenes.length - a.scenes.length
    );
  });

  const getPotentialDuplicates = (character: CharactersWithScenes[number]) => {
    return characters
      .filter((c) => c._id !== character._id)
      .sort((a, b) => {
        // Same type characters come first
        if (a.type === character.type && b.type !== character.type) return -1;
        if (b.type === character.type && a.type !== character.type) return 1;
        // Then sort alphabetically by name within each group
        return a.name.localeCompare(b.name);
      });
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case "PRINCIPAL":
        return <Star className="h-5 w-5" />;
      case "SECONDARY":
        return <User className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getGroupTitle = (group: string) => {
    switch (group) {
      case "PRINCIPAL":
        return t("groupedCharacters.principal");
      case "SECONDARY":
        return t("groupedCharacters.secondary");
      default:
        return t("groupedCharacters.others");
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      {Object.entries(groupedCharacters).map(([group, chars]) => (
        <div key={group} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {getGroupIcon(group)}
            {getGroupTitle(group)}
            <Badge variant="secondary">{chars.length}</Badge>
          </h3>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {chars.map((character) => (
              <CharacterSummaryCard
                key={character._id}
                character={character}
                potentialDuplicates={getPotentialDuplicates(character)}
              />
            ))}
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default CharactersTabContent;
