import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: {
    scriptId: Id<"scripts">;
    entityType: "characters" | "locations" | "props" | "scenes";
    entityId: string;
  };
}

export default async function EntityDetailPage({ params }: PageProps) {
  const { scriptId, entityType, entityId } = await params;

  // Validate entity type
  if (!["characters", "locations", "props", "scenes"].includes(entityType)) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {entityType.slice(0, -1).charAt(0).toUpperCase() +
            entityType.slice(1, -1)}{" "}
          Details
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Main content */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Overview</h2>
            <p className="text-muted-foreground">ID: {entityId}</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Appearances</h2>
            <p className="text-muted-foreground">
              Scene references will go here
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Related Entities</h2>
            <p className="text-muted-foreground">
              Connected entities will go here
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Notes</h2>
            <p className="text-muted-foreground">Entity notes will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
