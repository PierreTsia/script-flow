import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import CharacterSummaryCard from "./character-summary-card";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "@/components/ui/badge";
import { Star, Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateEntityDialog } from "./create-entity-dialog";
import CharacterForm from "./character-form";
import useSceneEntities from "@/hooks/useSceneEntities";
import { CharacterFormSchema } from "./character-form";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
interface CreateCharacterDialogProps {
  scriptId: Id<"scripts">;
  isOpen: boolean;
  onClose: () => void;
}

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

const CharactersTabContent = ({ scriptId }: { scriptId: Id<"scripts"> }) => {
  const t = useTranslations("ScriptEntitiesScreen");
  const { useGetCharactersByScriptId } = useScene();
  const characters = useGetCharactersByScriptId(scriptId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!characters) {
    return <EntityScreenSkeleton />;
  }

  // Group characters by type
  const groupedCharacters = {
    PRINCIPAL: characters.filter((char) => char.type === "PRINCIPAL"),
    SECONDARY: characters.filter((char) => char.type === "SECONDARY"),
    others: characters.filter(
      (char) => !["PRINCIPAL", "SECONDARY"].includes(char.type)
    ),
  };

  // Sort each group by number of scenes
  Object.keys(groupedCharacters).forEach((key) => {
    groupedCharacters[key as keyof typeof groupedCharacters].sort(
      (a, b) => b.scenes.length - a.scenes.length
    );
  });

  const getPotentialDuplicates = (character: CharactersWithScenes[number]) => {
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
        return <Star className="h-5 w-5" />;
      case "SECONDARY":
        return <User className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getGroupTitle = (group: string) => {
    switch (group) {
      case "PRINCIPAL":
        return t("groupedCharacters.principal");
      case "SECONDARY":
        return t("groupedCharacters.secondary");
      default:
        return t("groupedCharacters.others");
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
    </div>
  );
};

export default CharactersTabContent;
