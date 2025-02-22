import { CreateEntityDialog } from "@/components/script-entities-screen/create-entity-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { AlertDialogFooter } from "../ui/alert-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";
import { PropFormSchema } from "./prop-form";
import PropForm from "./prop-form";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CreateNewPropDialogProps {
  scriptId: Id<"scripts">;
  isOpen: boolean;
  onClose: () => void;
}

const CreateNewPropDialog = ({
  scriptId,
  isOpen,
  onClose,
}: CreateNewPropDialogProps) => {
  const { createNewProp, isLoading } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen.createNewPropDialog");

  const onSubmit = (values: PropFormSchema) => {
    createNewProp({
      scriptId,
      name: values.name,
      quantity: values.quantity ? parseInt(values.quantity) : 1,
      type: values.type,
    });
    onClose();
  };

  return (
    <CreateEntityDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
    >
      <PropForm onSubmit={onSubmit} />
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onClose()}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" form="edit-prop-form">
          {isLoading ? t("actions.saving") : t("actions.save")}
        </Button>
      </AlertDialogFooter>
    </CreateEntityDialog>
  );
};

export default CreateNewPropDialog;
