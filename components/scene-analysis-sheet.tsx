import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { TranslationValues, useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChevronDown, Loader2, Trash2, Save } from "lucide-react";
import { SceneAnalysis } from "@/lib/llm/providers/index";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDraftScenesAnalysis } from "@/hooks/useDraftScenesAnalysis";

const SceneCard = ({
  titleKey,
  descriptionKey,
  descriptionValues,
  children,
  footer,
}: {
  titleKey?: string;
  descriptionKey?: string;
  descriptionValues?: TranslationValues;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  const t = useTranslations("SceneAnalysis");

  return (
    <Card className="flex flex-col min-h-0">
      {(titleKey || descriptionKey) && (
        <CardHeader className="pb-2">
          {titleKey && <CardTitle className="text-lg">{t(titleKey)}</CardTitle>}
          {descriptionKey && (
            <CardDescription>
              {t(descriptionKey, descriptionValues)}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="flex-1 p-4 pt-0 min-h-0">{children}</CardContent>
      {footer && <CardFooter className="p-4 pt-0">{footer}</CardFooter>}
    </Card>
  );
};

const SceneAnalysisSheet = ({
  isOpen,
  selectedText,
  selectedPage,
  onOpenChange,
  onAnalyze,
  isAnalyzing,
  sceneAnalysis,
  scriptId,
}: {
  isOpen: boolean;
  selectedText: string;
  selectedPage?: number;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  sceneAnalysis: SceneAnalysis | null;
  isAnalyzing: boolean;
  scriptId: string;
}) => {
  const t = useTranslations("SceneAnalysis");
  const { drafts, addDraft, getDraft, removeDraft } =
    useDraftScenesAnalysis(scriptId);
  const [localAnalysis, setLocalAnalysis] = useState<SceneAnalysis | null>(
    null
  );

  useEffect(() => {
    const deepEqual = (a: any, b: any) =>
      JSON.stringify(a) === JSON.stringify(b);
    if (sceneAnalysis && !deepEqual(sceneAnalysis, localAnalysis)) {
      const existing = getDraft(sceneAnalysis.scene_number);
      if (!existing) {
        addDraft(sceneAnalysis.scene_number, JSON.stringify(sceneAnalysis));
      }
      setLocalAnalysis(sceneAnalysis);
    }
  }, [sceneAnalysis]);

  useEffect(() => {
    if (isOpen && sceneAnalysis?.scene_number) {
      const draft = getDraft(sceneAnalysis.scene_number);
      if (draft) {
        setLocalAnalysis(JSON.parse(draft.analysis));
      }
    }
  }, [isOpen, sceneAnalysis?.scene_number, getDraft]);

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
            {/* Text Selection Part */}
            <SceneCard
              titleKey="textSelectionTitle"
              descriptionKey={selectedPage ? "selectedPage" : undefined}
              descriptionValues={
                selectedPage ? { page: selectedPage } : undefined
              }
              footer={
                <Button
                  className="w-full"
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("analyzeButton")}
                </Button>
              }
            >
              <ScrollArea className="h-full rounded-md bg-foreground/10 p-4 max-h-[30vh]">
                <div className="text-muted-foreground pr-4">{selectedText}</div>
              </ScrollArea>
            </SceneCard>

            {/* Drafts Part */}
            {drafts.length > 0 && (
              <SceneCard
                titleKey="draftsTitle"
                descriptionKey="draftsCount"
                descriptionValues={{ count: drafts.length }}
              >
                <div className="p-4 space-y-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.sceneNumber}
                      className="group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() =>
                        setLocalAnalysis(JSON.parse(draft.analysis))
                      }
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {t("sceneNumber", { number: draft.sceneNumber })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(draft.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div
                        className="flex gap-2 ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDraft(draft.sceneNumber);

                          if (
                            localAnalysis?.scene_number === draft.sceneNumber
                          ) {
                            setLocalAnalysis(null);
                          }
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t("deleteDraft")}
                          className="h-8 w-8 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </SceneCard>
            )}

            {/* Results Part */}
            <SceneCard
              titleKey="analysisTitle"
              descriptionKey="analysisDescription"
              footer={
                <div className="w-full flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {drafts.some(
                      (d) => d.sceneNumber === localAnalysis?.scene_number
                    )
                      ? t("draftStatus.savedDraft")
                      : t("draftStatus.newAnalysis")}
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (localAnalysis?.scene_number) {
                        addDraft(
                          localAnalysis.scene_number,
                          JSON.stringify(localAnalysis)
                        );
                      }
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t("saveButton")}
                  </Button>
                </div>
              }
            >
              {localAnalysis ? (
                <div className="text-muted-foreground text-sm">
                  <div className="font-semibold">
                    Scene Number: {localAnalysis.scene_number}
                  </div>
                  <div className="mt-4">
                    Page Number: {localAnalysis.pageNumber}
                  </div>

                  {/* Characters Section */}
                  <div className="mt-4">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between cursor-pointer p-2 rounded-md bg-background hover:bg-muted">
                        Characters ({localAnalysis.characters.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                        {localAnalysis.characters.length > 0 ? (
                          localAnalysis.characters.map((character, i) => (
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
                        Props ({localAnalysis.props.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                        {localAnalysis.props.length > 0 ? (
                          localAnalysis.props.map((prop, i) => (
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
                        Locations ({localAnalysis.locations.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                        {localAnalysis.locations.length > 0 ? (
                          localAnalysis.locations.map((location, i) => (
                            <div key={`${location.name}-${i}`} className="py-1">
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
                <div>{t("noAnalysisAvailable")}</div>
              )}
            </SceneCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Utility function

export default SceneAnalysisSheet;
