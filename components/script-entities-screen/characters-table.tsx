"use client";

import { Button } from "@/components/ui/button";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "../ui/badge";
import {
  Star,
  Users,
  User,
  UserCog,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { EntityTable } from "../common/entity-table";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditCharacterDialog } from "./edit-character-dialog";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";

type Character = CharactersWithScenes["characters"][number];

interface CharactersTableProps {
  data: Character[];
  total: number;
  page: number;
  cursors: string[];
  nextCursor?: string | null;
  totalPages: number;
  sortBy: "name" | "type";
  sortOrder: "asc" | "desc";
  onPageChange: (page: number, cursors: string[]) => void;
  onSortChange: (sortBy: "name" | "type", sortOrder: "asc" | "desc") => void;
}

export function CharactersTable({
  data,
  total,
  page,
  cursors,
  nextCursor,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
}: CharactersTableProps) {
  const t = useTranslations("ScriptEntitiesScreen");
  const router = useRouter();
  const { deleteCharacter, isLoading } = useSceneEntities();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (character: Character) => {
    setSelectedCharacter(character);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Character>[] = [
    {
      accessorKey: "name",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder =
              sortBy === "name" && sortOrder === "asc" ? "desc" : "asc";
            onSortChange("name", newOrder);
          }}
          className="h-8 text-left font-medium flex items-center gap-1"
        >
          {t("table.columns.name")}
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const character = row.original;
        return (
          <div className="flex items-center gap-2">
            {character.type === "PRINCIPAL" && <Star className="h-4 w-4" />}
            {character.type === "SUPPORTING" && <Users className="h-4 w-4" />}
            {character.type === "FEATURED_EXTRA" && (
              <UserCog className="h-4 w-4" />
            )}
            {character.type === "SILENT_KEY" && <User className="h-4 w-4" />}
            {character.type === "ATMOSPHERE" && <Users className="h-4 w-4" />}
            <span>{character.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder =
              sortBy === "type" && sortOrder === "asc" ? "desc" : "asc";
            onSortChange("type", newOrder);
          }}
          className="h-8 text-left font-medium flex items-center gap-1"
        >
          {t("table.columns.type")}
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const translatedType = t(`characterTypes.${type.toLowerCase()}`);
        return <Badge variant="secondary">{translatedType}</Badge>;
      },
    },
    {
      accessorKey: "aliases",
      header: "Aliases",
      cell: ({ row }) => {
        const aliases = row.getValue("aliases") as string[];
        return aliases?.length ? aliases.join(", ") : "-";
      },
    },
    {
      accessorKey: "scenes",
      header: "Scenes",
      cell: ({ row }) => {
        const scenes = row.original.scenes;
        return <Badge variant="outline">{scenes.length}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">
                  {t("table.columns.actions.openMenu")}
                </span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleEdit(row.original)}
              >
                {t("table.columns.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  router.push(
                    `/scripts/${row.original.script_id}/entities/characters/${row.original._id}`
                  );
                }}
              >
                {t("table.columns.actions.viewDetails")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => handleDelete(row.original)}
              >
                {t("table.columns.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <EntityTable
        data={data}
        columns={columns}
        pagination={{
          page,
          cursors,
          totalPages,
          nextCursor,
        }}
        onPageChange={onPageChange}
        totalItems={total}
      />

      {selectedCharacter && (
        <>
          <EditCharacterDialog
            character={selectedCharacter}
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedCharacter(null);
            }}
          />
          <ConfirmDeleteDialog
            entityType="character"
            entityName={selectedCharacter.name}
            isOpen={isDeleteDialogOpen}
            isLoading={isLoading}
            setIsOpen={setIsDeleteDialogOpen}
            onDelete={async () => {
              await deleteCharacter({ characterId: selectedCharacter._id });
              setIsDeleteDialogOpen(false);
              setSelectedCharacter(null);
            }}
          />
        </>
      )}
    </>
  );
}
