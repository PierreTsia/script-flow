import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { PropsWithScenes } from "@/convex/props";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
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

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("name")}
                className="h-8 text-left font-medium"
              >
                {t("table.columns.name")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => toggleSort("scenesCount")}
                className="h-8 text-left font-medium"
              >
                {t("table.columns.scenesCount")}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>{t("table.columns.description")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((prop) => (
            <TableRow key={prop._id}>
              <TableCell>{prop.name}</TableCell>
              <TableCell>{prop.scenes?.length || 0}</TableCell>
              <TableCell>
                {prop.scenes.map((scene) => scene.notes).join(", ") || "-"}
              </TableCell>
              <TableCell className="text-right">
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
                      onClick={() => handleEdit(prop)}
                    >
                      {t("table.columns.actions.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        router.push(
                          `/scripts/${prop.script_id}/entities/props/${prop._id}`
                        );
                      }}
                    >
                      {t("table.columns.actions.viewDetails")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={() => handleDelete(prop)}
                    >
                      {t("table.columns.actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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

      <div className="flex items-center justify-between py-4">
        <CursorPagination
          state={{
            page,
            cursors,
            totalPages,
            nextCursor: nextCursor ?? undefined,
          }}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
