import type { DataModel } from "@/convex/_generated/dataModel";

type ScriptDocument = DataModel["scripts"]["document"];

interface ScriptContentProps {
  script: ScriptDocument;
  fileUrl: string;
}

export function ScriptContent({ script, fileUrl }: ScriptContentProps) {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{script.name}</h1>
        <span className="text-sm text-muted-foreground">
          {new Date(script._creationTime).toLocaleDateString()}
        </span>
      </div>
      {fileUrl && (
        <iframe src={fileUrl} className="h-full w-full border-none" />
      )}
    </div>
  );
}
