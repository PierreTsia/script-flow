"use client";

import { Id } from "@/convex/_generated/dataModel";
import { User, Clapperboard, FileText, Users, Merge } from "lucide-react";
import useCharacter from "@/hooks/useCharacter";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CharacterTypeIcon } from "./script-entities-screen/scene-summary-card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";

import useSceneEntities from "@/hooks/useSceneEntities";
import { useSearchEntities } from "@/hooks/useSearchEntities";
import debounce from "lodash.debounce";
import { Input } from "./ui/input";
import { isCharacter } from "@/convex/search";
import { useRouter } from "next/navigation";

interface CharacterDetailProps {
  characterId: Id<"characters">;
}

export function CharacterDetail({ characterId }: CharacterDetailProps) {
  const character = useCharacter(characterId);
  const scriptId = character?.script_id;
  const t = useTranslations("CharacterDetail");
  const [isOpen, setIsOpen] = useState(false);
  const { mergeCharacters } = useSceneEntities();
  const search = useSearchEntities(scriptId);
  const router = useRouter();
  const results = search.results;

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        search.handleSearch(query);
      }, 300),
    [search]
  );

  const handleConfirmMerge = async (targetId: Id<"characters">) => {
    await mergeCharacters({
      sourceCharacterId: characterId,
      targetCharacterId: targetId,
    });
    router.push(`/scripts/${scriptId}/entities/characters/${targetId}`);
    setIsOpen(false);
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  if (!character) return <div>{t("loading")}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {character.name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  character.type === "PRINCIPAL" ? "default" : "secondary"
                }
              >
                {t(`characterTypes.${character.type.toLowerCase()}`)}
              </Badge>
              {character.aliases && character.aliases.length > 0 && (
                <Badge variant="outline">{character.aliases.join(", ")}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Merge className="h-4 w-4 mr-2" />
                  {t("merge.button")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("merge.title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    {t("merge.description")}
                  </p>
                  <Input
                    className="w-full"
                    placeholder={t("merge.searchPlaceholder")}
                    onChange={(e) => debouncedSearch(e.target.value)}
                  />
                  {results
                    ?.filter((result) => isCharacter(result))
                    .filter((result) => result._id !== characterId)
                    .map((result) => (
                      <span
                        key={result._id}
                        className="w-full cursor-pointer flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors"
                        onClick={() => handleConfirmMerge(result._id)}
                      >
                        <div className="flex items-center gap-2 text-sm ">
                          <CharacterTypeIcon type={result.type} />
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">{result.name}</span>
                            {!!result?.aliases?.length && (
                              <span className="text-xs text-muted-foreground">
                                aka {result.aliases.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Merge className="h-4 w-4 text-muted-foreground" />
                      </span>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
            <CharacterTypeIcon type={character.type} />
          </div>
        </div>

        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("details.noDescription")}
        </p>
      </div>

      {/* Character Details - Mobile View */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t("details.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("details.type")}</span>
            <span>{character.type || t("details.notSpecified")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("details.aliases")}
            </span>
            <span>
              {character.aliases?.join(", ") || t("details.notSpecified")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Scene Appearances */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clapperboard className="h-4 w-4 text-primary" />
                {t("scenes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {character.scenes?.map((scene) => (
                  <div
                    key={scene._id}
                    className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {t("scenes.scene")} {scene.scene_number}
                        </Badge>
                        {scene.notes && (
                          <p className="text-sm text-muted-foreground">
                            {scene.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <FileText className="h-4 w-4" />
                      <span>
                        {t("scenes.page", { number: scene.page_number })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Character Arc Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Users className="h-4 w-4 text-primary" />
                {t("arc.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert">
                {t("arc.noNotes")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Desktop View */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {t("details.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.type")}
                </span>
                <span>{character.type || t("details.notSpecified")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.aliases")}
                </span>
                <span>
                  {character.aliases?.join(", ") || t("details.notSpecified")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.totalAppearances")}
                </span>
                <span>
                  {t("details.scenes", {
                    count: character.scenes?.length || 0,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
