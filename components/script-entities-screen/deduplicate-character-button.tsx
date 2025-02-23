import { CharactersWithScenes } from "@/convex/characters";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useTranslations } from "next-intl";
import useSceneEntities from "@/hooks/useSceneEntities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { GitMerge } from "lucide-react";

const DeduplicateCharacterButton = ({
  character,
  allCharacters,
}: {
  character: CharactersWithScenes["characters"][number];
  allCharacters: CharactersWithScenes["characters"];
}) => {
  const { deduplicateCharacter } = useSceneEntities();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const selectedTarget = allCharacters.find((c) => c._id === selectedTargetId);
  const t = useTranslations("ScriptEntitiesScreen");

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
        <SelectTrigger className="" title={t("characterMerge.buttonTitle")}>
          <GitMerge className="h-4 w-4" />
        </SelectTrigger>
        <SelectContent>
          {allCharacters.map((targetChar) => (
            <SelectItem key={targetChar._id} value={targetChar._id}>
              {t("characterMerge.mergeInto", { name: targetChar.name })}
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
            <AlertDialogTitle>
              {t("characterMerge.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("characterMerge.confirmDescription", {
                source: character.name,
                target: selectedTarget?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMerge}
              className="bg-green-600 hover:bg-green-700"
            >
              {t("characterMerge.mergeButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeduplicateCharacterButton;
