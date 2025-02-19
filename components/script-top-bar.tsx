"use client";

import { Eye, Database } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { usePathname } from "next/navigation";

export default function ScriptTopBar({
  name,
  creationTime,
  scriptId,
}: {
  name?: string;
  creationTime?: number;
  scriptId: Id<"scripts">;
}) {
  const pathname = usePathname();
  const isEntitiesScreen = pathname.includes("/entities");

  return (
    <ToggleGroup
      type="single"
      value={isEntitiesScreen ? "entities" : "viewer"}
      className="sticky top-0 z-50 max-h-[4rem] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-w-full z-10"
    >
      <ul className="h-14 px-4 md:px-6 flex items-center justify-between min-w-full">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-left">
            {name || "Untitled Script"}
          </h1>
          <p className="text-sm text-muted-foreground text-left">
            Uploaded:{" "}
            {creationTime ? new Date(creationTime).toLocaleString() : "Unknown"}
          </p>
        </div>

        <div className="flex items-center gap-2 w-[200px]">
          <Link href={`/scripts/${scriptId}/entities`}>
            <ToggleGroupItem value="entities">
              <Database className="w-4 h-4" />
              <span className="ml-2">Entities</span>
            </ToggleGroupItem>
          </Link>
          <Link href={`/scripts/${scriptId}/viewer`}>
            <ToggleGroupItem value="viewer">
              <Eye className="w-4 h-4" />
              <span className="ml-2">Viewer</span>
            </ToggleGroupItem>
          </Link>
        </div>
      </ul>
    </ToggleGroup>
  );
}
