"use client";

import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { useScripts } from "@/hooks/useScripts";
import { DataModel } from "@/convex/_generated/dataModel";
import { ScriptDocument } from "@/hooks/useScripts";

export default function ScriptTopBar({
  toggleSidebar,
  script,
}: {
  toggleSidebar: () => void;
  script: ScriptDocument;
}) {
  return (
    <NavigationMenu className="sticky top-0 z-50 max-h-[4rem] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-w-full">
      <ul className="h-14 px-4 md:px-6 flex items-center justify-between min-w-full">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-left">
            {script.name || "Untitled Script"}
          </h1>
          <p className="text-sm text-muted-foreground  text-left">
            Uploaded: {new Date(script._creationTime).toLocaleString()}
          </p>
        </div>

        <Button onClick={toggleSidebar} className="block lg:hidden ">
          <MenuIcon className="w-4 h-4" />
        </Button>
      </ul>
    </NavigationMenu>
  );
}
