"use client";

import { Button } from "@/components/ui/button";
import { LocationsWithScenes } from "@/convex/locations";
import { Badge } from "../ui/badge";
import { MapPin, ArrowUpDown, MoreVertical } from "lucide-react";
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
import { EditLocationDialog } from "./edit-location-dialog";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import useSceneEntities from "@/hooks/useSceneEntities";
import { TimeOfDayIcon } from "./time-of-day-icon";
import { TimeOfDay } from "@/convex/helpers";

type Location = LocationsWithScenes["locations"][number];

interface LocationsTableProps {
  data: Location[];
  total: number;
  page: number;
  cursors: string[];
  nextCursor?: string | null;
  totalPages: number;
  sortBy: "name" | "type" | "scenesCount";
  sortOrder: "asc" | "desc";
  onPageChange: (page: number, cursors: string[]) => void;
  onSortChange: (
    sortBy: "name" | "type" | "scenesCount",
    sortOrder: "asc" | "desc"
  ) => void;
}

export function LocationsTable({
  data,
  page,
  cursors,
  nextCursor,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onSortChange,
}: LocationsTableProps) {
  const t = useTranslations("ScriptEntitiesScreen");
  const router = useRouter();
  const { deleteLocation, isLoading } = useSceneEntities();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<Location>[] = [
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
        const location = row.original;
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location.name}</span>
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
        const translatedType = t(`locationTypes.${type.toLowerCase()}`);
        return <Badge variant="secondary">{translatedType}</Badge>;
      },
    },
    {
      accessorKey: "time_of_day",
      header: t("table.columns.time_of_day"),
      cell: ({ row }) => {
        const timeOfDay = row.getValue("time_of_day") as TimeOfDay;
        return (
          <div className="flex items-center gap-2">
            <TimeOfDayIcon timeOfDay={timeOfDay} />
            <span>{t(`timeOfDay.${timeOfDay.toLowerCase()}`)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "scenes",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            const newOrder =
              sortBy === "scenesCount" && sortOrder === "asc" ? "desc" : "asc";
            onSortChange("scenesCount", newOrder);
          }}
          className="h-8 text-left font-medium flex items-center gap-1"
        >
          {t("table.columns.scenesCount")}
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      ),
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
                    `/scripts/${row.original.script_id}/entities/locations/${row.original._id}`
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

      {selectedLocation && (
        <>
          <EditLocationDialog
            location={selectedLocation}
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedLocation(null);
            }}
          />
          <ConfirmDeleteDialog
            entityType="location"
            entityName={selectedLocation.name}
            isOpen={isDeleteDialogOpen}
            isLoading={isLoading}
            setIsOpen={setIsDeleteDialogOpen}
            onDelete={async () => {
              await deleteLocation({ locationId: selectedLocation._id });
              setIsDeleteDialogOpen(false);
              setSelectedLocation(null);
            }}
          />
        </>
      )}
    </>
  );
}
