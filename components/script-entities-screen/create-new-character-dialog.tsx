import { CreateEntityDialog } from "@/components/script-entities-screen/create-entity-dialog";
import CharacterForm from "@/components/script-entities-screen/character-form";
import { Id } from "@/convex/_generated/dataModel";
import { AlertDialogFooter } from "../ui/alert-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";
import { CharacterFormSchema } from "./character-form";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CreateNewCharacterDialogProps {
  scriptId: Id<"scripts">;
  isOpen: boolean;
  onClose: () => void;
}

const CreateNewCharacterDialog = ({
  scriptId,
  isOpen,
  onClose,
}: CreateNewCharacterDialogProps) => {
  const { createNewCharacter, isLoading } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen");
  const onSubmit = (values: CharacterFormSchema) => {
    createNewCharacter({
      scriptId,
      name: values.name,
      type: values.type,
      aliases: values.aliases
        ? values.aliases
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
    });
    onClose();
  };

  return (
    <CreateEntityDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Character"
      description="Create a new character for your script"
    >
      <CharacterForm onSubmit={onSubmit} />
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onClose()}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" form="edit-character-form">
          {isLoading ? t("actions.saving") : t("actions.save")}
        </Button>
      </AlertDialogFooter>
    </CreateEntityDialog>
  );
};
export default CreateNewCharacterDialog;
