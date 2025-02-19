import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DraftSceneAnalysis } from "@/hooks/useScene";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { EntitiesTabs } from "./script-entities-screen/entities-tabs";
import CharactersForm from "./script-entities-screen/characters-form";
import SceneInfoForm from "./script-entities-screen/scene-info-form";
import PropsForm from "./script-entities-screen/props-form";
import { useScene } from "@/hooks/useScene";
import { useState, useEffect } from "react";
import LocationsForm from "./script-entities-screen/locations-form";

type TabType = "scene_info" | "locations" | "characters" | "props";

export interface EntitiesFormProps {
  scriptId: Id<"scripts">;
  sceneId: Id<"scenes"> | null;
  selectedDraftAnalysis: DraftSceneAnalysis | null;
  onNextTab: () => void;
  children: React.ReactNode;
}

export const SceneAnalysisConfirmDialog = ({
  selectedDraftAnalysis,

  isOpen,
  setIsOpen,
}: {
  selectedDraftAnalysis: DraftSceneAnalysis | null;

  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const t = useTranslations("SceneAnalysis");

  console.log("selectedDraftAnalysis", selectedDraftAnalysis);

  const params = useParams();
  const scriptId = params.scriptId as Id<"scripts">;

  const [savedSceneId, setSavedSceneId] = useState<Id<"scenes"> | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>("scene_info");

  const { createScene, useGetSceneAndEntitiesByNumber } = useScene();
  const scene = useGetSceneAndEntitiesByNumber(
    scriptId,
    selectedDraftAnalysis?.scene_number ?? ""
  );

  useEffect(() => {
    if (scene?._id) {
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
    <AlertDialog open={isOpen}>
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
                <CancelButton onClose={() => setIsOpen(false)} />
              </SceneInfoForm>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations">
              <LocationsForm
                scriptId={scriptId}
                sceneId={savedSceneId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                onNextTab={() => setCurrentTab("characters")}
              >
                <CancelButton onClose={() => setIsOpen(false)} />
              </LocationsForm>
            </TabsContent>

            {/* Characters Tab */}
            <TabsContent value="characters">
              <CharactersForm
                scriptId={scriptId}
                sceneId={savedSceneId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                onNextTab={() => setCurrentTab("props")}
              >
                <CancelButton onClose={() => setIsOpen(false)} />
              </CharactersForm>
            </TabsContent>

            {/* Props Tab */}
            <TabsContent value="props">
              <PropsForm
                scriptId={scriptId}
                sceneId={savedSceneId}
                selectedDraftAnalysis={selectedDraftAnalysis}
                onNextTab={() => setCurrentTab("scene_info")}
              >
                <CancelButton onClose={() => setIsOpen(false)} />
              </PropsForm>
            </TabsContent>
          </EntitiesTabs>
        </ScrollArea>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const CancelButton = ({ onClose }: { onClose: () => void }) => {
  const t = useTranslations("SceneAnalysis");
  return (
    <Button
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {t("cancelButton")}
    </Button>
  );
};
export default SceneAnalysisConfirmDialog;
