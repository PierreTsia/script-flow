import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

import { useTranslations } from "next-intl";
import { LocationsWithScenes } from "@/convex/locations";
import useSceneEntities from "@/hooks/useSceneEntities";
import LocationForm, { LocationFormSchema } from "./location-form";

export const EditLocationDialog = ({
  location,
  isOpen,
  onClose,
}: {
  location: LocationsWithScenes[number];
  isOpen: boolean;
  onClose: () => void;
}) => {
  const t = useTranslations("ScriptEntitiesScreen.editLocationDialog");
  const { updateLocation, isLoading } = useSceneEntities();

  const onSubmit = async ({ name, type, time_of_day }: LocationFormSchema) => {
    await updateLocation({
      locationId: location._id,
      updates: {
        name,
        type,
        time_of_day,
      },
    });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>

        <LocationForm onSubmit={onSubmit} location={location} />

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" form="edit-location-form" disabled={isLoading}>
            {isLoading ? t("actions.saving") : t("actions.save")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
