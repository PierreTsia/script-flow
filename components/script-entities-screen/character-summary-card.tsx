import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clapperboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTranslations } from "next-intl";

import { CharactersWithScenes } from "@/convex/characters";
import DeduplicateCharacterButton from "@/components/script-entities-screen/deduplicate-character-button";

const CharacterSummaryCard = ({
  character,
  potentialDuplicates,
}: {
  character: CharactersWithScenes[number];
  potentialDuplicates?: CharactersWithScenes[number][];
}) => {
  const t = useTranslations("ScriptEntitiesScreen");

  return (
    <Card className="hover:bg-accent transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{character.name}</h3>
            {character.aliases && character.aliases.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                aka {character.aliases.join(", ")}
              </p>
            )}
          </div>
          <Badge
            variant={character.type === "PRINCIPAL" ? "default" : "secondary"}
          >
            {character.type.toLowerCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            {t("scenesCount", { count: character.scenes.length })}
          </p>
          <div className="flex flex-wrap gap-1">
            {character.scenes.length &&
              character.scenes.slice(0, 3).map((scene) => (
                <Tooltip key={scene?._id}>
                  <TooltipTrigger>
                    <Badge key={scene?._id} variant="outline">
                      <Clapperboard className="h-3 w-3 mr-1 inline" />{" "}
                      {scene.scene_number}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <pre className="text-xs max-w-[300px] whitespace-pre-wrap">
                      {scene.summary}
                    </pre>
                  </TooltipContent>
                </Tooltip>
              ))}
            {character.scenes.length > 3 && (
              <Badge variant="outline">
                +{character.scenes.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {potentialDuplicates && (
          <DeduplicateCharacterButton
            character={character}
            allCharacters={potentialDuplicates}
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          title="Edit character"
          className="hover:text-primary transition-colors"
          onClick={() => {
            // TODO: Implement edit logic
            console.log("Edit", character._id);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Delete character"
          className="hover:text-red-500 transition-colors"
          onClick={() => {
            // TODO: Implement delete logic
            console.log("Delete", character._id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CharacterSummaryCard;
