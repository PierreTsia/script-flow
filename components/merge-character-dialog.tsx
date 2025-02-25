import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { CharacterTypeIcon } from "./script-entities-screen/scene-summary-card";
import { Merge } from "lucide-react";
import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";
import { useSearchEntities } from "@/hooks/useSearchEntities";
import { useEffect } from "react";

interface MergeCharacterDialogProps {
  children: React.ReactNode;
  onMerge: (targetId: Id<"characters">) => void;
  characterId: Id<"characters">;
  scriptId: Id<"scripts">;
}

export function MergeCharacterDialog({
  children,
  onMerge,
  characterId,
  scriptId,
}: MergeCharacterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("CharacterDetail");
  const { getCharacterResults, handleSearch } = useSearchEntities(scriptId);
  const results = getCharacterResults();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            onChange={(e) => handleSearch(e.target.value)}
          />
          {results
            ?.filter((result) => result._id !== characterId)
            .map((result) => (
              <div
                key={result._id}
                className="cursor-pointer w-full flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors"
                onClick={() => {
                  onMerge(result._id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <CharacterTypeIcon type={result.type} />
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{result.name}</span>
                    {!!result.aliases?.length && (
                      <span className="text-xs text-muted-foreground">
                        aka {result.aliases.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <Merge className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
