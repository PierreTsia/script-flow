import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  BookOpen,
  UserCog,
  UserCircle2,
  User,
  Users,
  Pencil,
  Star,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CharacterType } from "@/convex/helpers";
import { CharacterDocument } from "@/convex/characters";
import { ScriptEntitiesResult } from "@/hooks/useScripts";
import { useTranslations } from "next-intl";
import ConfirmDeleteDialog from "@/components/script-entities-screen/confirm-delete-dialog";
import { useScene } from "@/hooks/useScene";
import { useState } from "react";
import EditSceneDialog from "./edit-scene-dialog";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import SceneSummaryCardProps from "./scene-summary-card-props";

export type SceneWithEntities = ScriptEntitiesResult["scenes"][number];

const partitionSceneCharacter = (
  characters?: (CharacterDocument | undefined)[]
) => {
  if (!characters) return { principal: [], others: [] };
  const validCharacters = characters.filter(
    (char): char is CharacterDocument => !!char
  );
  return validCharacters.reduce(
    (acc, char) => {
      if (char.type === "PRINCIPAL") {
        acc.principal.push(char);
      } else {
        acc.others.push(char);
      }
      return acc;
    },
    {
      principal: [] as CharacterDocument[],
      others: [] as CharacterDocument[],
    }
  );
};

const SceneSummaryCard = ({
  scene,
  scriptId,
}: {
  scene: SceneWithEntities;
  scriptId: Id<"scripts">;
}) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { deleteScene, isLoading } = useScene();
  return (
    <Card key={`scene-${scene._id}`} className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {t("sceneInfo.scene")} {scene.scene_number}
          </CardTitle>
          <div className="inline-flex items-center gap-x-2">
            <Dialog>
              <DialogTrigger>
                <BookOpen className="h-4 w-4 hover:cursor-pointer" />
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-[1000px]">
                <DialogHeader>
                  <DialogTitle>Scene {scene.scene_number}</DialogTitle>
                  <ScrollArea className="max-h-[calc(100vh-220px)] h-full w-full rounded-md p-4">
                    <DialogDescription asChild>
                      <pre className="text-sm w-full text-center overflow-x-auto whitespace-pre-wrap">
                        {scene.text}
                      </pre>
                    </DialogDescription>{" "}
                  </ScrollArea>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Link
              href={`/scripts/${scriptId}/viewer?page=${scene.page_number}`}
            >
              <Badge>
                {t("sceneInfo.page")} {scene.page_number}
              </Badge>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="grid gap-4">
          {/* Scene Summary */}
          <p className="text-sm text-muted-foreground">
            {scene.summary || scene.text.slice(0, 150) + "..."}
          </p>

          {/* Scene Entities */}
          <div className="grid grid-cols-3 gap-4">
            {/* Characters */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                {t("entityLabels.characters")}
              </h4>

              {/* PRINCIPAL Characters - Always expanded */}
              {!!partitionSceneCharacter(scene?.characters)?.principal
                ?.length && (
                <Collapsible defaultOpen className="space-y-2 mb-2">
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                    {t("entityTypes.main")}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1">
                      {partitionSceneCharacter(scene?.characters).principal.map(
                        (char, index) => (
                          <Badge
                            key={`partitioned-character-scene-${char?._id}-${scene._id}-${index}`}
                            variant="secondary"
                            className="inline-flex items-center gap-1"
                          >
                            <CharacterTypeIcon type={char?.type} /> {char?.name}
                          </Badge>
                        )
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Others Characters */}
              {!!partitionSceneCharacter(scene?.characters)?.others?.length && (
                <Collapsible className="space-y-2 mb-2">
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                    {t("entityTypes.others")}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1">
                      {partitionSceneCharacter(scene?.characters)?.others?.map(
                        (char) => (
                          <Badge
                            key={`character-scene-${char?._id}-${scene._id}`}
                            variant="secondary"
                            className="inline-flex items-center gap-1"
                          >
                            <CharacterTypeIcon type={char?.type} /> {char?.name}
                          </Badge>
                        )
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Locations */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                {t("entityLabels.locations")}
              </h4>
              <div className="flex flex-wrap gap-1">
                {scene?.locations.filter(Boolean).map((loc, index) => (
                  <Badge
                    key={`location-scene-${loc?._id}-${scene._id}-${index}`}
                    variant="secondary"
                  >
                    {loc?.name} ({loc?.type}/{loc?.time_of_day})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Props */}

            <SceneSummaryCardProps props={scene?.props} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {/*  <EditSceneDialog
          scene={scene}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          scriptId={scriptId}
        /> */}
        <Button
          variant="ghost"
          size="icon"
          title="Edit scene"
          className="hover:text-primary transition-colors"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <ConfirmDeleteDialog
          entityType="scene"
          entityName={scene.scene_number}
          isLoading={isLoading}
          onDelete={async () => {
            await deleteScene(scene._id);
          }}
        />
      </CardFooter>
    </Card>
  );
};

export default SceneSummaryCard;

const CharacterTypeIcon = ({ type }: { type: CharacterType }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const CharacterTypeIconMap: Record<CharacterType, React.ReactNode> = {
    PRINCIPAL: (
      <Tooltip>
        <TooltipTrigger>
          <Star className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{t("characterTypes.principal")}</TooltipContent>
      </Tooltip>
    ),
    SUPPORTING: (
      <Tooltip>
        <TooltipTrigger>
          <UserCircle2 className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{t("characterTypes.supporting")}</TooltipContent>
      </Tooltip>
    ),
    FEATURED_EXTRA: (
      <Tooltip>
        <TooltipTrigger>
          <UserCog className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{t("characterTypes.featured_extra")}</TooltipContent>
      </Tooltip>
    ),
    SILENT_KEY: (
      <Tooltip>
        <TooltipTrigger>
          <User className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{t("characterTypes.silent_key")}</TooltipContent>
      </Tooltip>
    ),
    ATMOSPHERE: (
      <Tooltip>
        <TooltipTrigger>
          <Users className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>{t("characterTypes.atmosphere")}</TooltipContent>
      </Tooltip>
    ),
  };
  return CharacterTypeIconMap[type];
};
