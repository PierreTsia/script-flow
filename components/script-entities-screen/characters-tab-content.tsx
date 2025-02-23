import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import CharacterSummaryCard from "./character-summary-card";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "@/components/ui/badge";
import { Star, Users, User, Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateEntityDialog } from "./create-entity-dialog";
import CharacterForm from "./character-form";
import useSceneEntities from "@/hooks/useSceneEntities";
import { CharacterFormSchema } from "./character-form";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { CharacterType } from "@/convex/helpers";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";

interface CreateCharacterDialogProps {
  scriptId: Id<"scripts">;
  isOpen: boolean;
  onClose: () => void;
}

type CharacterWithScenes = CharactersWithScenes["characters"][number];

const CreateCharacterDialog = ({
  scriptId,
  isOpen,
  onClose,
}: CreateCharacterDialogProps) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { createNewCharacter, isLoading } = useSceneEntities();

  const onSubmit = async (values: CharacterFormSchema) => {
    await createNewCharacter({
      scriptId,
      name: values.name,
      type: values.type,
      aliases: values.aliases
        ? values.aliases
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        : [],
    });
    onClose();
  };

  return (
    <CreateEntityDialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("createNewCharacterDialog.title")}
      description={t("createNewCharacterDialog.description")}
    >
      <CharacterForm onSubmit={onSubmit} />
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onClose()}>
          {t("createNewCharacterDialog.actions.cancel")}
        </Button>
        <Button type="submit" form="edit-character-form">
          {isLoading
            ? t("createNewCharacterDialog.actions.saving")
            : t("createNewCharacterDialog.actions.save")}
        </Button>
      </AlertDialogFooter>
    </CreateEntityDialog>
  );
};

const ITEMS_PER_PAGE = 12;

const CharactersTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const { useGetCharactersByScriptId } = useScene();

  const result = useGetCharactersByScriptId(
    scriptId,
    ITEMS_PER_PAGE,
    page === 1 ? undefined : cursors[page - 2]
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!result) {
    return <EntityScreenSkeleton />;
  }

  const { characters, nextCursor, total } = result;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const partitionCharactersByType = (characters: CharacterWithScenes[]) => {
    return characters.reduce(
      (acc, char) => {
        if (char.type === "PRINCIPAL") {
          acc.PRINCIPAL.push(char);
        } else if (char.type === "SUPPORTING") {
          acc.SUPPORTING.push(char);
        } else if (char.type === "FEATURED_EXTRA") {
          acc.FEATURED_EXTRA.push(char);
        } else if (char.type === "SILENT_KEY") {
          acc.SILENT_KEY.push(char);
        } else if (char.type === "ATMOSPHERE") {
          acc.ATMOSPHERE.push(char);
        }
        return acc;
      },
      {
        PRINCIPAL: [],
        SUPPORTING: [],
        FEATURED_EXTRA: [],
        SILENT_KEY: [],
        ATMOSPHERE: [],
      } as Record<CharacterType, CharacterWithScenes[]>
    );
  };

  // Group characters by type
  const groupedCharacters = partitionCharactersByType(characters);

  // Sort each group by number of scenes
  Object.keys(groupedCharacters).forEach((key) => {
    groupedCharacters[key as keyof typeof groupedCharacters].sort(
      (a, b) => b.scenes.length - a.scenes.length
    );
  });

  const getPotentialDuplicates = (character: CharacterWithScenes) => {
    return characters
      .filter((c) => c._id !== character._id)
      .sort((a, b) => {
        // Same type characters come first
        if (a.type === character.type && b.type !== character.type) return -1;
        if (b.type === character.type && a.type !== character.type) return 1;
        // Then sort alphabetically by name within each group
        return a.name.localeCompare(b.name);
      });
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case "PRINCIPAL":
        return <Star className="h-4 w-4" />;
      case "SUPPORTING":
        return <Users className="h-4 w-4" />;
      case "FEATURED_EXTRA":
        return <UserCog className="h-4 w-4" />;
      case "SILENT_KEY":
        return <User className="h-4 w-4" />;
      case "ATMOSPHERE":
        return <Users className="h-4 w-4" />;
    }
  };

  const getGroupTitle = (group: string) => {
    switch (group) {
      case "PRINCIPAL":
        return t("groupedCharacters.principal");
      case "SUPPORTING":
        return t("groupedCharacters.supporting");
      case "FEATURED_EXTRA":
        return t("groupedCharacters.featured_extra");
      case "SILENT_KEY":
        return t("groupedCharacters.silent_key");
      case "ATMOSPHERE":
        return t("groupedCharacters.atmosphere");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("charactersTitle")}</h2>
        <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("createNew")}
        </Button>
      </div>

      <CreateCharacterDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ScrollArea className="h-[calc(100vh-220px)]">
        {Object.entries(groupedCharacters).map(([group, chars]) => (
          <div key={group} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getGroupIcon(group)}
              {getGroupTitle(group)}
              <Badge variant="secondary">{chars.length}</Badge>
            </h3>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {chars.map((character) => (
                <CharacterSummaryCard
                  key={character._id}
                  character={character}
                  potentialDuplicates={getPotentialDuplicates(character)}
                />
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      <CursorPagination
        state={{
          page,
          cursors,
          totalPages,
          nextCursor,
        }}
        onPageChange={(newPage, newCursors) => {
          setPage(newPage);
          setCursors(newCursors);
        }}
      />
    </div>
  );
};

export default CharactersTabContent;
