"use client";

import { Button } from "@/components/ui/button";
import { useScripts } from "@/hooks/useScripts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Trash2 } from "lucide-react";

export function ScriptsListCard() {
  const { scripts, deleteScriptById } = useScripts();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Scripts</h3>
      </div>
      <div className="h-96 bg-muted/50 rounded-lg border p-4 overflow-y-auto">
        {!scripts?.length ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No scripts uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scripts?.map((script) => (
              <Card
                key={script._id}
                className="hover:bg-accent/50 transition-colors"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {script.storageId}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 w-8 p-0"
                      title="View script"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 w-8 p-0"
                      onClick={() => deleteScriptById(script._id)}
                      title="Delete script"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
