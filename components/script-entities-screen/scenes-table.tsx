"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { ArrowUpDown, MoreVertical } from "lucide-react";
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
import { SceneWithEntities } from "./scene-summary-card";

interface ScenesTableProps {
  data: SceneWithEntities[];
  page: number;
  cursors: string[];
  nextCursor?: string | null;
  totalPages: number;
  sortBy: "scene_number" | "characters_count";
  sortOrder: "asc" | "desc";
  onPageChange: (page: number, cursors: string[]) => void;
  onSortChange: (
    sortBy: "scene_number" | "characters_count",
    sortOrder: "asc" | "desc"
  ) => void;
}

export function ScenesTable({
  data,
  page,
  cursors,
  nextCursor,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
}: ScenesTableProps) {
  const t = useTranslations("ScriptEntitiesScreen");
  const router = useRouter();

  const columns: ColumnDef<SceneWithEntities>[] = [
    {
      accessorKey: "scene_number",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder =
              sortBy === "scene_number" && sortOrder === "asc" ? "desc" : "asc";
            onSortChange("scene_number", newOrder);
          }}
          className="h-8 text-left font-medium flex items-center gap-1"
        >
          {t("table.columns.sceneNumber")}
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        return <Badge variant="outline">{row.original.scene_number}</Badge>;
      },
    },
    {
      accessorKey: "summary",
      header: t("table.columns.summary"),
      cell: ({ row }) => (
        <div className="max-w-[400px] whitespace-normal break-words">
          {row.original.summary || "-"}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: t("table.columns.location"),
      cell: ({ row }) => {
        const location = row.original.locations[0];
        return location ? location.name : "-";
      },
    },
    {
      accessorKey: "characters",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder =
              sortBy === "characters_count" && sortOrder === "asc"
                ? "desc"
                : "asc";
            onSortChange("characters_count", newOrder);
          }}
          className="h-8 text-left font-medium flex items-center gap-1"
        >
          {t("table.columns.characters")}
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      ),
      cell: ({ row }) => {
        const characters = row.original.characters;
        return <Badge variant="outline">{characters.length}</Badge>;
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
                onClick={() => {
                  router.push(
                    `/scripts/${row.original.script_id}/scenes/${row.original._id}`
                  );
                }}
              >
                {t("table.columns.actions.viewDetails")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
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
    />
  );
}
