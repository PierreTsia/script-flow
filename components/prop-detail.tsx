"use client";

import { Id } from "@/convex/_generated/dataModel";
import useProp from "@/hooks/useProp";

interface PropDetailProps {
  propId: Id<"props">;
}

export function PropDetail({ propId }: PropDetailProps) {
  const { useGetPropById } = useProp();

  const prop = useGetPropById(propId);

  if (!prop) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {prop.name || "Unnamed Prop"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Character-specific layout and fields */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Prop Details</h2>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
