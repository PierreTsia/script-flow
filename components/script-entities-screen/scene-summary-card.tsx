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
  UserMinus,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CharacterType } from "@/convex/helpers";
import { CharacterDocument } from "@/convex/characters";
import { ScriptEntitiesResult } from "@/hooks/useScripts";
type SceneDocument = ScriptEntitiesResult["scenes"][number];

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

const SceneSummaryCard = ({ scene }: { scene: SceneDocument }) => {
  return (
    <Card key={scene._id} className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scene {scene.scene_number}</CardTitle>
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

            <Badge>Page {scene.page_number}</Badge>
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
              <h4 className="text-sm font-medium mb-2">Characters</h4>

              {/* PRINCIPAL Characters - Always expanded */}
              {!!partitionSceneCharacter(scene?.characters)?.principal
                ?.length && (
                <Collapsible defaultOpen className="space-y-2 mb-2">
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                    Main
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1">
                      {partitionSceneCharacter(scene?.characters).principal.map(
                        (char) => (
                          <Badge
                            key={char?._id}
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
                    Others
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1">
                      {partitionSceneCharacter(scene?.characters)?.others?.map(
                        (char) => (
                          <Badge
                            key={char?._id}
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
              <h4 className="text-sm font-medium mb-2">Locations</h4>
              <div className="flex flex-wrap gap-1">
                {scene?.locations.filter(Boolean).map((loc) => (
                  <Badge key={loc?._id} variant="secondary">
                    {loc?.name} ({loc?.type}/{loc?.time_of_day})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Props */}
            <div>
              <h4 className="text-sm font-medium mb-2">Props</h4>
              <div className="flex flex-wrap gap-1">
                {scene?.props.filter(Boolean).map((prop) => (
                  <Badge key={prop?._id} variant="secondary">
                    {prop?.name} ({prop?.quantity})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-start gap-2">
        <Button variant="outline">Edit</Button>
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  );
};

export default SceneSummaryCard;

const CharacterTypeIcon = ({ type }: { type: CharacterType }) => {
  const CharacterTypeIconMap: Record<CharacterType, React.ReactNode> = {
    PRINCIPAL: (
      <Tooltip>
        <TooltipTrigger>
          <UserCog className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Principal Character</TooltipContent>
      </Tooltip>
    ),
    SECONDARY: (
      <Tooltip>
        <TooltipTrigger>
          <UserCircle2 className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Secondary Character</TooltipContent>
      </Tooltip>
    ),
    FIGURANT: (
      <Tooltip>
        <TooltipTrigger>
          <User className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Figurant</TooltipContent>
      </Tooltip>
    ),
    SILHOUETTE: (
      <Tooltip>
        <TooltipTrigger>
          <UserMinus className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Silhouette</TooltipContent>
      </Tooltip>
    ),
    EXTRA: (
      <Tooltip>
        <TooltipTrigger>
          <Users className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>Extra</TooltipContent>
      </Tooltip>
    ),
  };
  return CharacterTypeIconMap[type];
};
