import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { PropsWithScenes } from "@/convex/props";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditPropDialog } from "./edit-prop-dialog";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";
import { ColumnDef } from "@tanstack/react-table";
import { EntityTable } from "../common/entity-table";

interface PropsTableProps {
  data: PropsWithScenes["props"];
  totalPages: number;
  page: number;
  cursors: string[];
  nextCursor: string | null;
  sortBy: "name" | "scenesCount";
  sortOrder: "asc" | "desc";
  onSortChange: (
    sortBy: "name" | "scenesCount",
    sortOrder: "asc" | "desc"
  ) => void;
  onPageChange: (page: number, cursors: string[]) => void;
}

type Prop = PropsWithScenes["props"][number];

export function PropsTable({
  data,
  totalPages,
  page,
  cursors,
  nextCursor,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
}: PropsTableProps) {
  const t = useTranslations("ScriptEntitiesScreen");
  const router = useRouter();
  const { deleteProp, isLoading } = useSceneEntities();
  const [selectedProp, setSelectedProp] = useState<Prop | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const toggleSort = (column: "name" | "scenesCount") => {
    if (sortBy === column) {
      onSortChange(column, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(column, "asc");
    }
  };

  const handleEdit = (prop: Prop) => {
    setSelectedProp(prop);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (prop: Prop) => {
    setSelectedProp(prop);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Prop>[] = [
    {
      accessorKey: "name",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("name")}
          className="h-8 text-left font-medium"
        >
          {t("table.columns.name")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "scenesCount",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => toggleSort("scenesCount")}
          className="h-8 text-left font-medium"
        >
          {t("table.columns.scenesCount")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => row.original.scenes?.length || 0,
    },
    {
      accessorKey: "description",
      header: t("table.columns.description"),
      cell: ({ row }) =>
        row.original.scenes.map((scene) => scene.notes).join(", ") || "-",
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
                    `/scripts/${row.original.script_id}/entities/props/${row.original._id}`
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

      {selectedProp && (
        <>
          <EditPropDialog
            prop={selectedProp}
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedProp(null);
            }}
          />
          <ConfirmDeleteDialog
            entityType="prop"
            entityName={selectedProp.name}
            isOpen={isDeleteDialogOpen}
            isLoading={isLoading}
            setIsOpen={setIsDeleteDialogOpen}
            onDelete={async () => {
              await deleteProp({ propId: selectedProp._id });
              setIsDeleteDialogOpen(false);
              setSelectedProp(null);
            }}
          />
        </>
      )}
    </>
  );
}
