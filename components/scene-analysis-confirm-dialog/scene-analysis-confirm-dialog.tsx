import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DraftSceneAnalysis } from "@/hooks/useScene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { EntitiesTabs } from "./entities-tabs";
import CharactersForm from "./characters-form";
import SceneInfoForm from "./scene-info-form";
import { useScene } from "@/hooks/useScene";
import { useState, useEffect } from "react";
import LocationsForm from "./locations-form";

type TabType = "scene_info" | "locations" | "characters" | "props";

export const SceneAnalysisConfirmDialog = ({
  selectedDraftAnalysis,
  children,
  isOpen,
  setIsOpen,
}: {
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const t = useTranslations("SceneAnalysis");

  const params = useParams();
  const scriptId = params.scriptId as Id<"scripts">;

  const [savedSceneId, setSavedSceneId] = useState<Id<"scenes"> | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>("scene_info");
  const { createScene, getSceneByNumber } = useScene(scriptId);
  const scene = getSceneByNumber(selectedDraftAnalysis?.scene_number);

  useEffect(() => {
    if (scene) {
      setSavedSceneId(scene._id);
    } else {
      setSavedSceneId(null);
      setCurrentTab("scene_info");
    }
  }, [scene, setSavedSceneId]);

  const onCreateScene = async (scene: {
    scene_number: string;
    page_number: number;
    text: string;
    summary: string;
  }) => {
    const sceneId = await createScene({
      ...scene,
      script_id: scriptId,
    });
    if (sceneId) {
      setCurrentTab("locations");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl h-[80vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            {t("saveConfirmationTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("saveConfirmationDescription", {
              sceneNumber: selectedDraftAnalysis?.scene_number,
              locationsCount: selectedDraftAnalysis?.locations?.length,
              charactersCount: selectedDraftAnalysis?.characters?.length,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="pr-4 h-[calc(80vh-180px)]">
          <EntitiesTabs
            key={savedSceneId ?? "new-scene"}
            sceneId={savedSceneId}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          >
            {/* Scene Tab */}
            <TabsContent value="scene_info">
              <SceneInfoForm
                scriptId={scriptId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                onCreateScene={onCreateScene}
              >
                <CancelButton setIsOpen={setIsOpen} />
              </SceneInfoForm>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations">
              <LocationsForm
                scriptId={scriptId}
                sceneId={savedSceneId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                setCurrentTab={setCurrentTab}
              >
                <CancelButton setIsOpen={setIsOpen} />
              </LocationsForm>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters">
              <CharactersForm
                scriptId={scriptId}
                sceneId={savedSceneId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                setCurrentTab={setCurrentTab}
              >
                <CancelButton setIsOpen={setIsOpen} />
              </CharactersForm>
            </TabsContent>

            {/* Props Tab */}
            <TabsContent value="props">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t("prop.name")}
                  </label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Orange Sofa"
                  />
                </div>
                {/* Add more prop fields */}
              </div>
            </TabsContent>
          </EntitiesTabs>
        </ScrollArea>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const CancelButton = ({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const t = useTranslations("SceneAnalysis");
  return (
    <Button
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        setIsOpen(false);
      }}
    >
      {t("cancelButton")}
    </Button>
  );
};
export default SceneAnalysisConfirmDialog;
