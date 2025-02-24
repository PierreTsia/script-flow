import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Moon,
  Clapperboard,
  Sunrise,
  Sunset,
  Clock,
  Eye,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocationsWithScenes } from "@/convex/locations";
import { Button } from "../ui/button";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { useState } from "react";
import { Pencil } from "lucide-react";
import useSceneEntities from "@/hooks/useSceneEntities";
import { EditLocationDialog } from "./edit-location-dialog";
import { useTranslations } from "next-intl";
import { TimeOfDay } from "@/convex/helpers";
import Link from "next/link";
const TimeOfDayIcon = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const iconMap: Record<TimeOfDay, React.ReactNode> = {
    DAY: <Sun className="h-4 w-4" />,
    NIGHT: <Moon className="h-4 w-4" />,
    DAWN: <Sunrise className="h-4 w-4" />,
    DUSK: <Sunset className="h-4 w-4" />,
    UNSPECIFIED: <Clock className="h-4 w-4" />,
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{iconMap[timeOfDay]}</div>
      </TooltipTrigger>
      <TooltipContent>
        {t(`timeOfDay.${timeOfDay.toLowerCase()}`)}
      </TooltipContent>
    </Tooltip>
  );
};

const LocationSummaryCard = ({
  location,
}: {
  location: LocationsWithScenes["locations"][number];
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { deleteLocation, isLoading } = useSceneEntities();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{location.name}</h4>
          <TimeOfDayIcon timeOfDay={location.time_of_day} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-1">
          {location.scenes?.map((scene) => (
            <TooltipProvider key={scene._id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    <Clapperboard className="h-3 w-3 mr-1" />
                    {scene.scene_number}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{scene.summary}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <CardFooter className="flex gap-2 justify-end">
          <Link
            href={`/scripts/${location.script_id}/entities/locations/${location._id}`}
          >
            <Button variant="ghost" size="icon" title="View location">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <ConfirmDeleteDialog
            entityType="location"
            entityName={location.name}
            isLoading={isLoading}
            onDelete={async () => {
              await deleteLocation({
                locationId: location._id,
              });
            }}
          />

          <EditLocationDialog
            location={location}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
          />

          <Button
            variant="ghost"
            size="icon"
            title="Edit location"
            className="hover:text-primary transition-colors"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default LocationSummaryCard;
