"use client";

import { useTranslations } from "next-intl";
import { Id } from "@/convex/_generated/dataModel";
import { useScene } from "@/hooks/useScene";
import EntityScreenSkeleton from "./entity-screen-skeleton";
import CharacterSummaryCard from "./character-summary-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateEntityDialog } from "./create-entity-dialog";
import CharacterForm from "./character-form";
import useSceneEntities from "@/hooks/useSceneEntities";
import { CharacterFormSchema } from "./character-form";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { CharactersTable } from "./characters-table";
import { ViewToggle } from "./view-toggle";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "grid">("table");
  const [pageSize] = useState(25);
  const [sortBy, setSortBy] = useState<"name" | "type">(
    (searchParams.get("sortBy") as "name" | "type") || "type"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );

  const { useGetCharactersByScriptId } = useScene();
  const result = useGetCharactersByScriptId({
    scriptId,
    limit: pageSize,
    cursor: page === 1 ? undefined : cursors[page - 2],
    sortBy,
    sortOrder,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const updateUrlWithSort = (
    newSortBy: "name" | "type",
    newSortOrder: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    params.set("sortOrder", newSortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!result) {
    return <EntityScreenSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{t("charactersTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("stats.charactersTotal", { count: result.total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("createNew")}
          </Button>
        </div>
      </div>

      <CreateCharacterDialog
        scriptId={scriptId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {view === "table" ? (
        <CharactersTable
          data={result.characters}
          total={result.total}
          totalPages={Math.ceil(result.total / pageSize)}
          page={page}
          cursors={cursors}
          nextCursor={result.nextCursor}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
            setCursors([]);
            updateUrlWithSort(newSortBy, newSortOrder);
          }}
          onPageChange={(newPage, newCursors) => {
            setPage(newPage);
            setCursors(newCursors);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {result.characters.map((character) => (
              <CharacterSummaryCard key={character._id} character={character} />
            ))}
          </div>
          <CursorPagination
            state={{
              page,
              cursors,
              totalPages: Math.ceil(result.total / pageSize),
              nextCursor: result.nextCursor ?? undefined,
            }}
            onPageChange={(newPage, newCursors) => {
              setPage(newPage);
              setCursors(newCursors);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CharactersTabContent;
