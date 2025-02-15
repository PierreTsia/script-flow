import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";

const tabs = ["scene_info", "locations", "characters", "props"] as const;
export type TabType = (typeof tabs)[number];

export const EntitiesTabs = ({
  currentTab,
  setCurrentTab,
  children,
  sceneId,
}: {
  children: React.ReactNode;
  sceneId: Id<"scenes"> | null;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}) => {
  const t = useTranslations("SceneAnalysis");

  return (
    <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as TabType)}>
      <TabsList className="grid grid-cols-4 w-full mb-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            disabled={tab !== "scene_info" && !sceneId}
          >
            {t(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};
