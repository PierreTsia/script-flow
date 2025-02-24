"use client";

import { Id } from "@/convex/_generated/dataModel";
import { MapPin, Clapperboard, FileText, Home, Building } from "lucide-react";
import useLocation from "@/hooks/useLocation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimeOfDayIcon } from "./scene-detail";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

interface LocationDetailProps {
  locationId: Id<"locations">;
}

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

export function LocationDetail({ locationId }: LocationDetailProps) {
  const { useGetLocationById } = useLocation();
  const location = useGetLocationById(locationId);
  const t = useTranslations("LocationDetail");

  if (!location) return <div>{t("loading")}</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 inline-flex gap-2">
            <h1 className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              {location.name}
            </h1>
            <div className="flex items-center gap-2">
              {location.type && <LocationTypeIcon type={location.type} />}
              <TimeOfDayIcon timeOfDay={location.time_of_day} />
            </div>
          </div>
        </div>

        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Dummy description
        </p>
      </div>

      {/* Location Details - Mobile View */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {t("details.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("details.type")}</span>
            <span>{location.type || t("details.notSpecified")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("details.timeOfDay")}
            </span>
            <span>{t("details.notSpecified")}</span>
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
                {location.scenes?.map((scene) => (
                  <div
                    key={scene._id}
                    className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-medium text-xl"
                        >
                          {scene.scene_number}
                        </Badge>
                      </div>
                      {scene.notes && (
                        <p className="text-sm text-muted-foreground">
                          {scene.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <FileText className="h-4 w-4" />
                        <span>Page {scene.page_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                {t("notes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert">
                {t("notes.noNotes")}
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
                <span>{location.type || t("details.notSpecified")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.timeOfDay")}
                </span>
                <span>{t("details.notSpecified")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("details.totalAppearances")}
                </span>
                <span>
                  {t("details.scenes", { count: location.scenes?.length || 0 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
