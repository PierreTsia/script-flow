import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Undo2 } from "lucide-react";

interface EntityItemProps {
  id: Id<"characters" | "locations" | "props">;
  name: string;
  type?: string;
  markedForDeletion: boolean;
  onToggleDelete: (id: Id<"characters" | "locations" | "props">) => void;
}

const SceneEntityItem = ({
  id,
  name,
  type,
  markedForDeletion,
  onToggleDelete,
}: EntityItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 rounded-md transition-all duration-200",
        markedForDeletion ? "bg-muted/50 opacity-75" : "bg-muted"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            markedForDeletion && "line-through text-muted-foreground"
          )}
        >
          {name}
        </span>
        {type && (
          <Badge
            variant={markedForDeletion ? "outline" : "secondary"}
            className={cn(markedForDeletion && "opacity-50")}
          >
            {type}
          </Badge>
        )}
      </div>
      <Button variant="ghost" size="icon" onClick={() => onToggleDelete(id)}>
        {markedForDeletion ? (
          <Undo2 className="h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SceneEntityItem;
