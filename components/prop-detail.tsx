"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Package, Clapperboard, FileText } from "lucide-react";
import useProp from "@/hooks/useProp";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PropBadge from "./ui/prop-badge";

interface PropDetailProps {
  propId: Id<"props">;
}

export function PropDetail({ propId }: PropDetailProps) {
  const { useGetPropById } = useProp();
  const prop = useGetPropById(propId);

  if (!prop) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              {prop.name}
            </h1>
            <div className="flex items-center gap-2">
              <PropBadge type={prop.type} className="text-sm">
                {prop.type}
              </PropBadge>
              {prop.quantity && (
                <Badge variant="outline" className="text-sm">
                  Qty: {prop.quantity}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <>
          <Separator />
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a dummy description. Real one will be added soon.
          </p>
        </>
      </div>

      {/* Scene Details - Mobile View */}
      <Card className="md:hidden">
        <CardHeader>
          <CardTitle className="text-base font-medium">Prop Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span>Not specified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span>Not specified</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Scene Appearances */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clapperboard className="h-4 w-4 text-primary" />
                Scene Appearances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {prop.scenes?.map((scene) => (
                  <div
                    key={scene._id}
                    className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          Scene {scene.scene_number}
                        </p>

                        {scene.notes && (
                          <p className="text-sm text-muted-foreground">
                            {scene.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Page {scene.page_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                Notes & References
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert">
                {"No additional notes"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Desktop View */}
        <div className="hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Prop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{"Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span>{"Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Appearances</span>
                <span>{prop.scenes?.length || 0} scenes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
