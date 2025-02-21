import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useScene } from "@/hooks/useScene";
import { Id } from "@/convex/_generated/dataModel";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import PropSummaryCard from "./prop-summary-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

const PropsTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetPropsByScriptId } = useScene();
  const props = useGetPropsByScriptId(scriptId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!props) return <EntityScreenSkeleton />;

  // Group props by usage frequency
  const groupedProps = {
    recurring: props.filter((prop) => prop.scenes.length > 1),
    oneOff: props.filter((prop) => prop.scenes.length <= 1),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("propsTitle")}</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("createNew")}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        {Object.entries(groupedProps).map(([group, items]) => (
          <div key={group} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t(`propsDetails.${group}`)}
              <Badge variant="secondary">{items.length}</Badge>
            </h3>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((prop) => (
                <PropSummaryCard key={prop._id} prop={prop} />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default PropsTabContent;
