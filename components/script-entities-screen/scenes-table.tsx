"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
import { useState } from "react";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import { useScene } from "@/hooks/useScene";
import EditSceneDialog from "./edit-scene-dialog";

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
  const { deleteScene } = useScene();
  const [selectedScene, setSelectedScene] = useState<SceneWithEntities | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = (scene: SceneWithEntities) => {
    setSelectedScene(scene);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (scene: SceneWithEntities) => {
    setSelectedScene(scene);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedScene) {
      await deleteScene(selectedScene._id);
      setIsDeleteDialogOpen(false);
      setSelectedScene(null);
    }
  };

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
                <MoreHorizontal className="h-4 w-4" />
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
                    `/scripts/${row.original.script_id}/entities/scenes/${row.original._id}`
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
      />

      {selectedScene && (
        <>
          <EditSceneDialog
            scene={selectedScene}
            scriptId={selectedScene.script_id}
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedScene(null);
            }}
          />
          <ConfirmDeleteDialog
            entityType="scene"
            entityName={`Scene ${selectedScene?.scene_number}`}
            isOpen={isDeleteDialogOpen}
            setIsOpen={setIsDeleteDialogOpen}
            onDelete={handleConfirmDelete}
            isLoading={false}
          />
        </>
      )}
    </>
  );
}
