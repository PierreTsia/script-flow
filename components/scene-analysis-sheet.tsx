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

import { ChevronDown, Save, MapPin, Users, Box, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import SceneAnalysisCard from "./scene-analysis-card";
import {
  DraftSceneAnalysis,
  SceneCharacter,
  SceneLocation,
  SceneProp,
  useScene,
} from "@/hooks/useScene";
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
        className="h-[90vh] lg:h-[70vh] flex flex-col"
      >
        <SheetHeader className="pb-4">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 overflow-hidden">
          {/* Left Panel - Draft List */}
          <div className="h-[30vh] lg:h-auto overflow-y-auto lg:overflow-y-auto border-b lg:border-r">
            <SceneAnalysisCard
              titleKey="draftsTitle"
              descriptionKey="draftsCount"
              descriptionValues={{ count: drafts.length }}
            >
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
              titleKey="analysisTitle"
              descriptionKey="analysisDescription"
              footer={
                <div className="w-full flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedDraftAnalysis
                      ? t("draftStatus.savedDraft")
                      : t("draftStatus.newAnalysis")}
                  </div>
                  <Button variant="default" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    {t("saveButton")}
                  </Button>
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
                      items={selectedDraftAnalysis.locations as SceneLocation[]}
                    />

                    {/* Characters Section */}
                    <SectionCollapsible
                      type="characters"
                      title={`Characters (${selectedDraftAnalysis.characters.length})`}
                      items={
                        selectedDraftAnalysis.characters as SceneCharacter[]
                      }
                    />

                    {/* Props Section */}
                    <SectionCollapsible
                      type="props"
                      title={`Props (${selectedDraftAnalysis.props.length})`}
                      items={selectedDraftAnalysis.props as SceneProp[]}
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

// Updated SectionCollapsible with height constraints
const SectionCollapsible = ({
  title,
  type,
  items,
  maxHeight = "200px",
}: {
  title: string;
  type: "locations" | "characters" | "props";
  items: SceneLocation[] | SceneCharacter[] | SceneProp[];
  maxHeight?: string;
}) => {
  // Determine icon and color based on section type

  const iconConfig = {
    locations: {
      icon: <MapPin className="h-4 w-4 text-white" />,
      bgColor: "bg-blue-600",
    },
    characters: {
      icon: <Users className="h-4 w-4 text-white" />,
      bgColor: "bg-red-600",
    },
    props: {
      icon: <Box className="h-4 w-4 text-white" />,
      bgColor: "bg-green-600",
    },
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group">
        <div className={`${iconConfig[type].bgColor} p-2 rounded-lg`}>
          {iconConfig[type].icon}
        </div>
        <span className="font-medium flex-1 text-left">{title}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div
          className="bg-foreground/10 rounded overflow-y-auto"
          style={{ maxHeight }}
        >
          <div className="p-2 space-y-2 text-sm">
            {items.length > 0 ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className="py-2 px-3 rounded-md bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {item.name || "Unnamed Item"}
                    </span>
                    {"type" in item && (
                      <span className="text-muted-foreground text-xs">
                        {item?.type || "No type specified"}
                      </span>
                    )}
                  </div>
                  {"notes" in item && (
                    <p className="text-muted-foreground text-xs mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-2">No items found</div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SceneAnalysisSheet;
