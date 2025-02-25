import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Clapperboard, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTranslations } from "next-intl";

import { CharactersWithScenes } from "@/convex/characters";
import useSceneEntities from "@/hooks/useSceneEntities";
import ConfirmDeleteDialog from "@/components/script-entities-screen/confirm-delete-dialog";
import { EditCharacterDialog } from "./edit-character-dialog";
import { useState } from "react";
import Link from "next/link";

const CharacterSummaryCard = ({
  character,
}: {
  character: CharactersWithScenes["characters"][number];
}) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { deleteCharacter, isLoading } = useSceneEntities();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card>
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
            {t(`characterTypes.${character.type.toLowerCase()}`)}
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
              character.scenes.slice(0, 3).map((scene, index) => (
                <Tooltip
                  key={`character-scene-${character._id}-${scene._id}-${index}`}
                >
                  <TooltipTrigger>
                    <Badge variant="outline">
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
        <Link
          href={`/scripts/${character.script_id}/entities/characters/${character._id}`}
        >
          <Button variant="ghost" size="icon" title="View character">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>

        {/*          <DeduplicateCharacterButton
            character={character}
            allCharacters={potentialDuplicates}
          /> */}

        <ConfirmDeleteDialog
          entityType="character"
          entityName={character.name}
          isLoading={isLoading}
          onDelete={async () => {
            await deleteCharacter({ characterId: character._id });
          }}
        />
        <EditCharacterDialog
          character={character}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />

        <Button
          variant="ghost"
          size="icon"
          title="Edit character"
          className="hover:text-primary transition-colors"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CharacterSummaryCard;
