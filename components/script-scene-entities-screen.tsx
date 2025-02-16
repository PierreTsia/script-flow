import { useScripts } from "@/hooks/useScripts";
import { Id } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  UserCog,
  Users,
  User,
  UserCircle2,
  UserMinus,
} from "lucide-react";
import { CharacterDocument } from "@/convex/characters";
import { CharacterType } from "@/convex/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const ScriptSceneEntitiesScreen = ({
  scriptId,
}: {
  scriptId: Id<"scripts">;
}) => {
  const { getScriptEntities } = useScripts();
  const entities = getScriptEntities(scriptId);

  if (!entities) {
    return <EntityScreenSkeleton />;
  }

  const partitionSceneCharactersByMainTypeAndOthers = (
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

  return (
    <div className="flex flex-col w-full bg-background flex-1 p-6 gap-6">
      {/* Script Header */}

      {/* Main Content */}
      <Tabs defaultValue="scenes" className="flex-1">
        <TabsList>
          <TabsTrigger value="scenes">Scenes Overview</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
        </TabsList>

        {/* Scenes Tab */}
        <TabsContent value="scenes" className="flex-1">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {entities.scenes.map((scene) => (
                <Card key={scene._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Scene {scene.scene_number}</CardTitle>
                      <Badge>Page {scene.page_number}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                            Characters
                          </h4>

                          {/* PRINCIPAL Characters - Always expanded */}
                          {!!partitionSceneCharactersByMainTypeAndOthers(
                            scene?.characters
                          )?.principal?.length && (
                            <Collapsible defaultOpen className="space-y-2 mb-2">
                              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ChevronDown className="h-4 w-4" />
                                Main
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="flex flex-wrap gap-1">
                                  {partitionSceneCharactersByMainTypeAndOthers(
                                    scene?.characters
                                  ).principal.map((char) => (
                                    <Badge
                                      key={char?._id}
                                      variant="secondary"
                                      className="inline-flex items-center gap-1"
                                    >
                                      <CharacterTypeIcon type={char?.type} />{" "}
                                      {char?.name}
                                    </Badge>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          {/* Others Characters */}
                          {!!partitionSceneCharactersByMainTypeAndOthers(
                            scene?.characters
                          )?.others?.length && (
                            <Collapsible className="space-y-2 mb-2">
                              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ChevronDown className="h-4 w-4" />
                                Others
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="flex flex-wrap gap-1">
                                  {partitionSceneCharactersByMainTypeAndOthers(
                                    scene?.characters
                                  )?.others?.map((char) => (
                                    <Badge
                                      key={char?._id}
                                      variant="secondary"
                                      className="inline-flex items-center gap-1"
                                    >
                                      <CharacterTypeIcon type={char?.type} />{" "}
                                      {char?.name}
                                    </Badge>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>

                        {/* Locations */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">
                            Locations
                          </h4>
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
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
      </Tabs>
    </div>
  );
};

const EntityScreenSkeleton = () => (
  <div className="flex flex-col w-full bg-background flex-1 p-6 gap-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-10 w-full" />
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

export default ScriptSceneEntitiesScreen;
