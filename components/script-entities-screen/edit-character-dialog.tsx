import { Id } from "@/convex/_generated/dataModel";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import useSceneEntities from "@/hooks/useSceneEntities";
import { useTranslations } from "next-intl";
import { CharacterType } from "@/convex/helpers";
import CharacterForm, { CharacterFormSchema } from "./character-form";

interface EditCharacterDialogProps {
  character: {
    _id: Id<"characters">;
    name: string;
    type: CharacterType;
    aliases?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function EditCharacterDialog({
  character,
  isOpen,
  onClose,
}: EditCharacterDialogProps) {
  const { updateCharacter, isLoading } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen.editCharacterDialog");

  async function onSubmit(values: CharacterFormSchema) {
    await updateCharacter({
      characterId: character._id,
      updates: {
        name: values.name,
        type: values.type,
        aliases: values.aliases
          ? values.aliases
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : [],
      },
    });
    onClose();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <CharacterForm character={character} onSubmit={onSubmit} />
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" form="edit-character-form">
            {isLoading ? t("actions.saving") : t("actions.save")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
