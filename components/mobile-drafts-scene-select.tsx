import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DraftSceneAnalysis } from "@/hooks/useScene";

const MobileDraftsSceneSelect = ({
  drafts,
  selectedDraft,
  onSelect,
}: {
  drafts: DraftSceneAnalysis[];
  selectedDraft: DraftSceneAnalysis | null;
  onSelect: (draftId: string | null) => void;
}) => {
  return (
    <Select
      value={selectedDraft?._id || ""}
      onValueChange={(value) => onSelect(value || null)}
    >
      <SelectTrigger className="w-full h-9 px-3 py-1 text-sm">
        <SelectValue placeholder="Select a scene draft" />
      </SelectTrigger>
      <SelectContent>
        {drafts.map((draft) => (
          <SelectItem
            key={draft._id}
            value={draft._id}
            className="text-sm h-9 px-3 py-1"
          >
            <div className="flex items-center justify-between w-full gap-x-2">
              <span>{draft.scene_number}</span>
              <span className="text-muted-foreground text-xs">
                {draft.locations[0]?.name || "No location"}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MobileDraftsSceneSelect;
