import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

const tabs = ["scenes", "characters", "locations", "props"] as const;
export type TabType = (typeof tabs)[number];

export const TabsPageMenu = ({
  currentTab,
  setCurrentTab,
  children,
}: {
  children: React.ReactNode;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}) => {
  const t = useTranslations("ScriptEntitiesScreen");

  return (
    <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as TabType)}>
      <TabsList className="grid grid-cols-4 w-full mb-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {t(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};
