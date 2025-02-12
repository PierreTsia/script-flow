import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SceneAnalysisSheet = ({
  isOpen,
  selectedText,
  selectedPage,
  onOpenChange,
  onAnalyze,
  isAnalyzing,
}: {
  isOpen: boolean;
  selectedText: string;
  selectedPage?: number;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}) => {
  const t = useTranslations("SceneAnalysis");

  useEffect(() => {
    if (selectedText && !isOpen) {
      onOpenChange(true);
    }
  }, [selectedText, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="hidden">
        <button className="hidden" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[100vh] md:h-[60vh] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card className="h-full flex flex-col max-h-[80vh] lg:max-h-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {t("textSelectionTitle")}
              </CardTitle>
              {selectedPage && (
                <CardDescription>
                  {t("selectedPage", { page: selectedPage })}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-4 pt-0">
              <ScrollArea className="h-full max-h-[65vh] lg:max-h-none rounded-md bg-foreground/10 p-4">
                <div className="text-muted-foreground pr-4">{selectedText}</div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                onClick={onAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("analyzingButton")}
                  </div>
                ) : (
                  t("analyzeButton")
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{t("analysisTitle")}</CardTitle>
              <CardDescription>{t("analysisDescription")}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 p-4">
              <div className="text-muted-foreground text-sm">
                {t("emptyAnalysis")}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SceneAnalysisSheet;
