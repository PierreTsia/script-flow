"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  Clapperboard,
  MapPin,
  User,
  Package,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Home,
  Building,
  BookOpen,
} from "lucide-react";
import { useScene } from "@/hooks/useScene";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CharacterTypeIcon } from "./script-entities-screen/scene-summary-card";
import { TimeOfDay } from "@/convex/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import PropBadge from "./ui/prop-badge";
import Link from "next/link";
import { useParams } from "next/navigation";

import { SceneText } from "./scene-detail/scene-text";

interface SceneDetailProps {
  sceneId: Id<"scenes">;
}

export const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  const t = useTranslations("SceneAnalysis");
  const iconMap: Record<TimeOfDay, React.ReactNode> = {
    DAY: <Sun className="h-6 w-6" />,
    NIGHT: <Moon className="h-6 w-6" />,
    DAWN: <Sunrise className="h-6 w-6" />,
    DUSK: <Sunset className="h-6 w-6" />,
    UNSPECIFIED: <Clock className="h-6 w-6" />,
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{iconMap[timeOfDay]}</TooltipTrigger>
        <TooltipContent>
          {t(`timeOfDay.${timeOfDay.toLowerCase()}`)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LocationTypeIcon = ({ type }: { type: string }) => {
  const isInterior = type?.toLowerCase().includes("int");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="flex items-center gap-1 text-xs">
            {isInterior ? (
              <Home className="h-3 w-3" />
            ) : (
              <Building className="h-3 w-3" />
            )}
            {type}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isInterior ? "Interior Location" : "Exterior Location"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function SceneDetail({ sceneId }: SceneDetailProps) {
  const { useGetSceneById } = useScene();
  const t = useTranslations("SceneDetail");
  const scene = useGetSceneById(sceneId);
  const params = useParams();
  const scriptId = params.scriptId as string;

  if (!scene) return <div>{t("loading")}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
              <Clapperboard className="h-6 w-6 text-primary" />
              Scene {scene.scene_number}
            </h1>
            <Link
              href={`/scripts/${scriptId}/viewer?page=${scene.page_number}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Badge className="flex items-center gap-1 text-xs">
                <BookOpen className="h-4 w-4" />
                {t("pageNumber", { number: scene.page_number })}
              </Badge>
            </Link>
          </div>
        </div>

        {scene.summary && (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scene.summary}
            </p>
          </>
        )}
      </div>

      {/* Scene Details - Mobile View */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t("details.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("details.duration")}
            </span>
            <span>{t("details.notSpecified")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("details.timeOfDay")}
            </span>
            <span>{t("details.notSpecified")}</span>
          </div>
          <Separator className="my-4" />
          <SceneText text={scene.text} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Locations Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                {t("locations.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scene.locations.map((location) => (
                  <div
                    key={location._id}
                    className="flex items-start justify-between rounded-lg p-3"
                  >
                    <div className="flex flex-col items-start gap-2">
                      <p className="font-medium">{location.name}</p>
                      {location.type && (
                        <div className="mt-1">
                          <LocationTypeIcon type={location.type} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <TimeOfDayIcon
                        timeOfDay={location.time_of_day || "UNSPECIFIED"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <User className="h-4 w-4 text-primary" />
                {t("characters.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {scene.characters.map((character) => (
                  <div key={character._id} className="rounded-lg  p-3">
                    <div className="font-medium flex items-center gap-2">
                      <CharacterTypeIcon type={character.type!} />
                      {character.name}
                    </div>
                    {character.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {character.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Package className="h-4 w-4 text-primary" />
                {t("props.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {scene.props.map((prop) => (
                  <div
                    key={prop._id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="inline-flex items-center gap-2 w-full">
                        <p className="font-medium">{prop.name}</p>
                        <PropBadge className="mr-auto" type={prop.type}>
                          {prop.type}
                        </PropBadge>
                        {prop.quantity && (
                          <Badge variant="outline" className="text-xs">
                            {t("props.quantity", { number: prop.quantity })}
                          </Badge>
                        )}
                      </div>
                      {prop.notes && (
                        <p className="text-sm text-muted-foreground">
                          {prop.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
                  {t("details.duration")}
                </span>
                <span>{t("details.notSpecified")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.timeOfDay")}
                </span>
                <span>{t("details.notSpecified")}</span>
              </div>
              <Separator className="my-4" />
              <SceneText text={scene.text} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
