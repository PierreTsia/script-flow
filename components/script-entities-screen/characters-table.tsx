"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CharactersWithScenes } from "@/convex/characters";
import { Badge } from "../ui/badge";
import {
  Star,
  Users,
  User,
  UserCog,
  Settings2,
  ArrowUpDown,
} from "lucide-react";
import { CursorPagination } from "@/components/ui/cursor-pagination/cursor-pagination";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<Character>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder =
                sortBy === "name" && sortOrder === "asc" ? "desc" : "asc";
              onSortChange("name", newOrder);
            }}
            className="flex items-center gap-1"
          >
            Name
            {sortBy === "name" && (
              <ArrowUpDown
                className={cn("h-4 w-4", sortOrder === "desc" && "rotate-180")}
              />
            )}
          </Button>
        );
      },
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newOrder =
                sortBy === "type" && sortOrder === "asc" ? "desc" : "asc";
              onSortChange("type", newOrder);
            }}
            className="flex items-center gap-1"
          >
            Type
            {sortBy === "type" && (
              <ArrowUpDown
                className={cn("h-4 w-4", sortOrder === "desc" && "rotate-180")}
              />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("type")}</Badge>
      ),
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {t(`table.columns.${column.id}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>{t("table.columns.toggle")}</TooltipContent>
        </Tooltip>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {total} total characters
        </div>
        <CursorPagination
          state={{
            page,
            cursors,
            totalPages,
            nextCursor,
          }}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
