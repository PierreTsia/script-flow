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
import { ChevronDown, Loader2 } from "lucide-react";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SceneAnalysisSheet = ({
  isOpen,
  selectedText,
  selectedPage,
  onOpenChange,
  onAnalyze,
  isAnalyzing,
  sceneAnalysis,
}: {
  isOpen: boolean;
  selectedText: string;
  selectedPage?: number;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  sceneAnalysis: SceneAnalysis | null;
  isAnalyzing: boolean;
}) => {
  const t = useTranslations("SceneAnalysis");

  console.log("sceneAnalysis", sceneAnalysis);
  console.log("Props received:", {
    isOpen,
    selectedText,
    selectedPage,
    sceneAnalysis,
  });

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
        className="h-[100vh] lg:max-h-[65vh] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 pb-4 lg:max-h-[60vh]">
            <Card className="flex flex-col min-h-0">
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

              <CardContent className="flex-1 p-4 pt-0 min-h-0">
                <ScrollArea className="h-full rounded-md bg-foreground/10 p-4 max-h-[30vh]">
                  <div className="text-muted-foreground pr-4">
                    {selectedText}
                  </div>
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

            <Card className="flex flex-col min-h-0">
              <CardHeader>
                <CardTitle>{t("analysisTitle")}</CardTitle>
                <CardDescription>{t("analysisDescription")}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-y-auto">
                {sceneAnalysis ? (
                  <div className="text-muted-foreground text-sm">
                    <div className="font-semibold">
                      Scene Number: {sceneAnalysis.scene_number}
                    </div>
                    <div className="mt-4">
                      Page Number: {sceneAnalysis.pageNumber}
                    </div>

                    {/* Characters Section */}
                    <div className="mt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between cursor-pointer p-2 rounded-md bg-background hover:bg-muted">
                          Characters ({sceneAnalysis.characters.length}):
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                          {sceneAnalysis.characters.length > 0 ? (
                            sceneAnalysis.characters.map((character, i) => (
                              <div
                                key={`${character.name}-${i}`}
                                className="py-1"
                              >
                                {character.name} ({character.type})
                              </div>
                            ))
                          ) : (
                            <div>No characters found</div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Props Section */}
                    <div className="mt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between cursor-pointer p-2 rounded-md bg-background hover:bg-muted">
                          Props ({sceneAnalysis.props.length}):
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                          {sceneAnalysis.props.length > 0 ? (
                            sceneAnalysis.props.map((prop, i) => (
                              <div key={`${prop.name}-${i}`} className="py-1">
                                {prop.name} (Quantity: {prop.quantity}
                                {prop.notes ? `, Notes: ${prop.notes}` : ""})
                              </div>
                            ))
                          ) : (
                            <div>No props found</div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Locations Section */}
                    <div className="mt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between cursor-pointer p-2 rounded-md bg-background hover:bg-muted">
                          Locations ({sceneAnalysis.locations.length}):
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                          {sceneAnalysis.locations.length > 0 ? (
                            sceneAnalysis.locations.map((location, i) => (
                              <div
                                key={`${location.name}-${i}`}
                                className="py-1"
                              >
                                {location.name} ({location.type},{" "}
                                {location.time_of_day})
                              </div>
                            ))
                          ) : (
                            <div>No locations found</div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                ) : (
                  <div>No analysis available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SceneAnalysisSheet;
