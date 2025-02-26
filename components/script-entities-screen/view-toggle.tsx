"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { TableProperties, Grid2X2 } from "lucide-react";

interface ViewToggleProps {
  view: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <Menubar className="border-none">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">
          {view === "table" ? (
            <TableProperties className="h-4 w-4" />
          ) : (
            <Grid2X2 className="h-4 w-4" />
          )}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => onViewChange("table")}>
            <TableProperties className="h-4 w-4 mr-2" />
            Table View
          </MenubarItem>
          <MenubarItem onClick={() => onViewChange("grid")}>
            <Grid2X2 className="h-4 w-4 mr-2" />
            Grid View
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
