import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clapperboard, Eye, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PropsWithScenes } from "@/convex/props";
import useSceneEntities from "@/hooks/useSceneEntities";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { EditPropDialog } from "./edit-prop-dialog";
import { useState } from "react";
import PropBadge from "../ui/prop-badge";
import Link from "next/link";
export default function PropSummaryCard({
  prop,
}: {
  prop: PropsWithScenes["props"][number];
}) {
  const t = useTranslations("ScriptEntitiesScreen");
  const { deleteProp, isLoading } = useSceneEntities();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{prop.name}</h4>
          <PropBadge type={prop.type} quantity={prop.quantity}>
            {t(`prop.type.${prop.type.toLowerCase()}`)}
          </PropBadge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {prop.scenes?.map((scene) => (
            <TooltipProvider key={scene._id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    <Clapperboard className="h-3 w-3 mr-1" />
                    {scene.scene_number}
                  </Badge>
                </TooltipTrigger>
                {scene.notes && (
                  <TooltipContent>
                    <p className="max-w-xs">{scene.notes}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link href={`/scripts/${prop.script_id}/entities/props/${prop._id}`}>
          <Button variant="ghost" size="icon" title="View prop">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <ConfirmDeleteDialog
          entityType="prop"
          entityName={prop.name}
          isLoading={isLoading}
          onDelete={async () => {
            await deleteProp({ propId: prop._id });
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          title="Edit prop"
          className="hover:text-primary transition-colors"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <EditPropDialog
          prop={prop}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </CardFooter>
    </Card>
  );
}
