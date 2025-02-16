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

import { Save, Trash2 } from "lucide-react";

import MobileDraftsSceneSelect from "./mobile-drafts-scene-select";
import SceneAnalysisCard from "./scene-analysis-card";
import { DraftSceneAnalysis, useScene } from "@/hooks/useScene";

import { Id } from "@/convex/_generated/dataModel";

import SectionCollapsible from "./section-collapsible";
import SceneAnalysisConfirmDialog from "./scene-analysis-confirm-dialog/scene-analysis-confirm-dialog";

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

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="hidden">
        <button className="hidden" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[90vh] lg:h-[70vh] flex flex-col"
      >
        <SheetHeader className="pb-4">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        {/* Mobile Select - Outside grid */}
        <div className="lg:hidden mb-4">
          <MobileDraftsSceneSelect
            drafts={drafts}
            selectedDraft={selectedDraftAnalysis}
            onSelect={(draftId: string | null) => {
              if (draftId) {
                setselectedDraftAnalysis(
                  drafts.find((draft) => draft._id === draftId) || null
                );
              } else {
                setselectedDraftAnalysis(null);
              }
            }}
          />
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 overflow-hidden">
          {/* Left Panel - Draft List */}
          <div className="hidden lg:block h-[30vh] lg:h-auto overflow-y-auto lg:overflow-y-auto border-b lg:border-r">
            <SceneAnalysisCard>
              <div className="space-y-1">
                {drafts.map((draft) => (
                  <div
                    key={draft._id}
                    className={`group flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer transition-colors ${
                      selectedDraftAnalysis?._id === draft._id ? "bg-muted" : ""
                    }`}
                    onClick={() => setselectedDraftAnalysis(draft)}
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="font-medium line-clamp-1">
                          {t("sceneNumber", { number: draft.scene_number })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(draft._creationTime).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {draft.locations[0]?.name || t("noPreviewAvailable")}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(draft._id);
                        setselectedDraftAnalysis(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </SceneAnalysisCard>
          </div>

          {/* Right Panel - Draft Details */}
          <div className="flex flex-col overflow-hidden lg:overflow-hidden">
            <SceneAnalysisCard
              footer={
                <div className="w-full flex items-center justify-between mt-4 pt-4 border-t">
                  {selectedDraftAnalysis && (
                    <SceneAnalysisConfirmDialog
                      selectedDraftAnalysis={selectedDraftAnalysis}
                      isOpen={isConfirmDialogOpen}
                      setIsOpen={setIsConfirmDialogOpen}
                    >
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsConfirmDialogOpen(true)}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {t("saveButton")}
                      </Button>
                    </SceneAnalysisConfirmDialog>
                  )}
                </div>
              }
            >
              {selectedDraftAnalysis ? (
                <div className="flex-1 flex flex-col h-full">
                  <div className="pb-4 border-b">
                    <h3 className="font-semibold">
                      {t("sceneNumber", {
                        number: selectedDraftAnalysis.scene_number,
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Page {selectedPage} • Created{" "}
                      {new Date(
                        selectedDraftAnalysis._creationTime
                      ).toLocaleString()}
                    </p>
                  </div>

                  {/* Content Sections - Now with constrained height */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-6 max-h-[calc(100vh-320px)]">
                    <SectionCollapsible
                      type="locations"
                      title={`Locations (${selectedDraftAnalysis.locations.length})`}
                      items={selectedDraftAnalysis.locations}
                    />

                    {/* Characters Section */}
                    <SectionCollapsible
                      type="characters"
                      title={`Characters (${selectedDraftAnalysis.characters.length})`}
                      items={selectedDraftAnalysis.characters}
                    />

                    {/* Props Section */}
                    <SectionCollapsible
                      type="props"
                      title={`Props (${selectedDraftAnalysis.props.length})`}
                      items={selectedDraftAnalysis.props}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  {t("noAnalysisSelected")}
                </div>
              )}
            </SceneAnalysisCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SceneAnalysisSheet;
