import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitMerge, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

import { CharactersWithScenes } from "@/convex/characters";
import useSceneEntities from "@/hooks/useSceneEntities";
import { Id } from "@/convex/_generated/dataModel";

const CharacterSummaryCard = ({
  character,
  potentialDuplicates,
}: {
  character: CharactersWithScenes[number];
  potentialDuplicates?: CharactersWithScenes[number][];
}) => {
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
          <p className="mb-2">{character.scenes.length} scenes</p>
          <div className="flex flex-wrap gap-1">
            {character.scenes.slice(0, 3).map((scene) => (
              <Badge key={scene._id} variant="outline">
                Scene {scene.scene_number}
              </Badge>
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

const DeduplicateCharacterButton = ({
  character,
  allCharacters,
}: {
  character: CharactersWithScenes[number];
  allCharacters: CharactersWithScenes[number][];
}) => {
  const { deduplicateCharacter } = useSceneEntities();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const selectedTarget = allCharacters.find((c) => c._id === selectedTargetId);

  const handleMerge = () => {
    if (!selectedTargetId) return;
    deduplicateCharacter({
      duplicatedCharacterId: character._id,
      targetCharacterId: selectedTargetId as Id<"characters">,
    });
    setSelectedTargetId(null); // Reset after merge
  };

  return (
    <div className="w-[60px] hover:text-green-500 transition-colors">
      <Select
        onValueChange={(targetCharId) => {
          setSelectedTargetId(targetCharId);
        }}
      >
        <SelectTrigger className="" title="Merge with another character">
          <GitMerge className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          {allCharacters.map((targetChar) => (
            <SelectItem key={targetChar._id} value={targetChar._id}>
              Merge into {targetChar.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog
        open={!!selectedTargetId}
        onOpenChange={() => setSelectedTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              The character {character.name} will be merged into
              {selectedTarget?.name}. After merging, {selectedTarget?.name} will
              have {character.name} as an alias. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              className="bg-green-600 hover:bg-green-700"
            >
              Merge Characters
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
