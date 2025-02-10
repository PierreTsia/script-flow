"use client";

import { Button } from "@/components/ui/button";
import { useScripts } from "@/hooks/useScripts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function ScriptsListCard() {
  const { scripts } = useScripts();
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
