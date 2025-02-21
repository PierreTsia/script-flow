import { CreateEntityDialog } from "@/components/script-entities-screen/create-entity-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { AlertDialogFooter } from "../ui/alert-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";
import { LocationFormSchema } from "./location-form";
import LocationForm from "./location-form";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CreateNewLocationDialogProps {
  scriptId: Id<"scripts">;
  isOpen: boolean;
  onClose: () => void;
}

const CreateNewLocationDialog = ({
  scriptId,
  isOpen,
  onClose,
}: CreateNewLocationDialogProps) => {
  const { createNewLocation, isLoading } = useSceneEntities();
  const t = useTranslations("ScriptEntitiesScreen.createNewLocationDialog");

  const onSubmit = (values: LocationFormSchema) => {
    createNewLocation({
      scriptId,
      name: values.name,
      type: values.type,
      time_of_day: values.time_of_day,
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
      <LocationForm onSubmit={onSubmit} />
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onClose()}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" form="edit-location-form">
          {isLoading ? t("actions.saving") : t("actions.save")}
        </Button>
      </AlertDialogFooter>
    </CreateEntityDialog>
  );
};

export default CreateNewLocationDialog;
