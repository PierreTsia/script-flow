import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Clapperboard } from "lucide-react";
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

const LocationSummaryCard = ({
  location,
}: {
  location: LocationsWithScenes[number];
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { deleteLocation, isLoading } = useSceneEntities();
  return (
    <Card className="hover:bg-accent transition-colors">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{location.name}</h4>
          {location.time_of_day === "DAY" ? (
            <Sun className="h-4 w-4" />
          ) : location.time_of_day === "NIGHT" ? (
            <Moon className="h-4 w-4" />
          ) : null}
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
