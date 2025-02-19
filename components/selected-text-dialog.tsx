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
const SelectedTextDialog = ({
  isDialogOpen,
  onOpenChange,
  selectedText,
  selectedPage,
  onConfirmClick,
  isAnalyzing,
}: {
  isDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  selectedPage: number;
  isAnalyzing: boolean;

  onConfirmClick: () => Promise<void>;
}) => {
  return (
    <AlertDialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Extract from page {selectedPage}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ScrollArea className="h-full rounded-md bg-foreground/10  max-h-[30vh] text-muted-foreground p-4">
              <pre className="text-sm w-full text-center overflow-x-auto whitespace-pre-wrap">
                {selectedText}
              </pre>
            </ScrollArea>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={async () => {
              await onConfirmClick();
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyse"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SelectedTextDialog;
