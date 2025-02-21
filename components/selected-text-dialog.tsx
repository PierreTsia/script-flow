import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

type SelectedTextDialogProps = {
  isDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  selectedPage: number;
  isAnalyzing: boolean;
  onConfirmClick: () => Promise<void>;
  onCancelClick: () => void;
};

const SelectedTextDialog = ({
  isDialogOpen,
  onOpenChange,
  selectedText,
  selectedPage,
  onConfirmClick,
  onCancelClick,
  isAnalyzing,
}: SelectedTextDialogProps) => {
  const t = useTranslations("SelectedTextDialog");

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("title", { page: selectedPage })}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ScrollArea className="h-full rounded-md bg-foreground/10 max-h-[30vh] text-muted-foreground p-4">
              <pre className="text-sm w-full text-center overflow-x-auto whitespace-pre-wrap">
                {selectedText}
              </pre>
            </ScrollArea>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancelClick}>
            {t("cancel")}
          </AlertDialogCancel>
          <Button onClick={onConfirmClick}>
            {isAnalyzing
              ? t("analyzeButton.analyzing")
              : t("analyzeButton.analyze")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SelectedTextDialog;
