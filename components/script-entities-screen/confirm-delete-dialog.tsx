import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
const ConfirmDeleteDialog = ({
  onDelete,
  entityType,
  entityName,
  isLoading = false,
  isOpen,
  setIsOpen,
}: {
  onDelete: () => Promise<void>;
  entityType: "character" | "location" | "prop" | "scene";
  entityName: string;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const t = useTranslations("ScriptEntitiesScreen");
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Delete character"
          className="hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("confirmDeleteDialog.title", {
              entityType,
              entityName,
            })}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {t("confirmDeleteDialog.description", {
            entityType: t(`confirmDeleteDialog.entityType.${entityType}`),
            entityName,
          })}
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">{t("confirmDeleteDialog.cancel")}</Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={async () => {
              await onDelete();
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("confirmDeleteDialog.delete")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
