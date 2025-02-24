"use client";

import { Id } from "@/convex/_generated/dataModel";
import { User, Clapperboard, FileText, Users } from "lucide-react";
import useCharacter from "@/hooks/useCharacter";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CharacterTypeIcon } from "./script-entities-screen/scene-summary-card";

import { useTranslations } from "next-intl";

interface CharacterDetailProps {
  characterId: Id<"characters">;
}

export function CharacterDetail({ characterId }: CharacterDetailProps) {
  const character = useCharacter(characterId);
  const t = useTranslations("CharacterDetail");

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
          <CharacterTypeIcon type={character.type} />
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
