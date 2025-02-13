import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { ChevronDown, Trash2, Save } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import SceneAnalysisCard from "./scene-analysis-card";
import { DraftSceneAnalysis, useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";

const SceneAnalysisSheet = ({
  isOpen,
  selectedPage,
  onOpenChange,
  scriptId,
}: {
  isOpen: boolean;
  selectedText: string;
  selectedPage?: number;
  onOpenChange: (open: boolean) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  scriptId: Id<"scripts">;
}) => {
  const t = useTranslations("SceneAnalysis");
  const { drafts, handleDeleteDraft } = useScene(scriptId);

  const [selectedDraftAnalysis, setselectedDraftAnalysis] =
    useState<DraftSceneAnalysis | null>(null);

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
            {/* Drafts Part */}
            {drafts.length > 0 && (
              <SceneAnalysisCard
                titleKey="draftsTitle"
                descriptionKey="draftsCount"
                descriptionValues={{ count: drafts.length }}
              >
                <div className="space-y-2">
                  {/* TODO: fix this */}
                  {drafts.map((draft) => (
                    <div
                      key={draft._id}
                      className={`group flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${
                        selectedDraftAnalysis?._id === draft._id
                          ? "bg-muted"
                          : ""
                      }`}
                      onClick={() => setselectedDraftAnalysis(draft)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {t("sceneNumber", { number: draft.scene_number })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(draft._creationTime).toLocaleString()}
                        </div>
                      </div>

                      <div
                        className="flex gap-2 ml-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDraft(draft._id);
                          setselectedDraftAnalysis(null);
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
              </SceneAnalysisCard>
            )}

            {/* Results Part */}
            <SceneAnalysisCard
              titleKey="analysisTitle"
              descriptionKey="analysisDescription"
              footer={
                <div className="w-full flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {drafts.some((d) => d._id === selectedDraftAnalysis?._id)
                      ? t("draftStatus.savedDraft")
                      : t("draftStatus.newAnalysis")}
                  </div>

                  <Button variant="default" size="sm" onClick={() => {}}>
                    <Save className="mr-2 h-4 w-4" />
                    {t("saveButton")}
                  </Button>
                </div>
              }
            >
              {selectedDraftAnalysis ? (
                <div className="text-muted-foreground text-sm">
                  <div className="font-semibold">
                    Page {selectedPage}, Scene{" "}
                    {selectedDraftAnalysis.scene_number}
                  </div>

                  {/* Locations Section */}
                  <div className="mt-4">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between cursor-pointer rounded-md bg-background hover:bg-muted">
                        Locations ({selectedDraftAnalysis.locations.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className=" bg-foreground/10 rounded mt-2">
                        {selectedDraftAnalysis?.locations.length > 0 ? (
                          selectedDraftAnalysis.locations.map(
                            (location: {
                              name: string;
                              type: string;
                              time_of_day: string;
                            }) => (
                              <div key={location.name} className="py-1">
                                {location.name} ({location.type},{" "}
                                {location.time_of_day})
                              </div>
                            )
                          )
                        ) : (
                          <div>No locations found</div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Characters Section */}
                  <div className="mt-4">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between cursor-pointer rounded-md bg-background hover:bg-muted">
                        Characters ({selectedDraftAnalysis.characters.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                        {selectedDraftAnalysis.characters.length > 0 ? (
                          selectedDraftAnalysis.characters.map(
                            (character, i) => (
                              <div
                                key={`${character.name}-${i}`}
                                className="py-1"
                              >
                                {character.name} ({character.type})
                              </div>
                            )
                          )
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
                        Props ({selectedDraftAnalysis.props.length}):
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2 bg-foreground/10 rounded mt-2 p-1">
                        {selectedDraftAnalysis.props.length > 0 ? (
                          selectedDraftAnalysis.props.map((prop, i) => (
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
                </div>
              ) : (
                <div>{t("noAnalysisAvailable")}</div>
              )}
            </SceneAnalysisCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SceneAnalysisSheet;
