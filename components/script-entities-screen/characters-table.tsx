"use client";

import { Button } from "@/components/ui/button";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "../ui/badge";
import { Star, Users, User, UserCog, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { EntityTable } from "../common/entity-table";

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
  ];

  return (
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
  );
}
