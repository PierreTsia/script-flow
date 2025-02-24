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
interface SceneDetailProps {
  sceneId: Id<"scenes">;
}

const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  const t = useTranslations("S");
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
  const scene = useGetSceneById(sceneId);

  if (!scene) return <div>Loading...</div>;

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
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Page {scene.page_number}</span>
            </div>
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

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Locations Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-xl font-bold">
                <MapPin className="h-4 w-4 text-primary" />
                Locations
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
              <CardTitle className="flex items-center gap-2 text-base text-xl font-bold">
                <User className="h-6 w-6 text-primary" />
                Characters
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
              <CardTitle className="flex items-center gap-2 text-base text-xl font-bold">
                <Package className="h-4 w-4 text-primary" />
                Props
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
                            Qty: {prop.quantity}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-xl font-bold">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span>{"Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time of Day</span>
                {scene.locations[0].time_of_day || "Not specified"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
