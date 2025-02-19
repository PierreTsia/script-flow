import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface EntitySelectProps<T extends { _id: string; name: string }> {
  availableEntities?: T[];
  onSelect: (entity: T) => void;
  placeholder: string;
}

export function EntitySelect<T extends { _id: string; name: string }>({
  availableEntities,
  onSelect,
  placeholder,
}: EntitySelectProps<T>) {
  const [showSelect, setShowSelect] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {showSelect ? (
        <Select
          onValueChange={(value) => {
            const entity = availableEntities?.find((e) => e._id === value);
            if (entity) {
              onSelect(entity);
              setShowSelect(false);
            }
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableEntities?.map((entity) => (
              <SelectItem key={entity._id} value={entity._id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSelect(true);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
