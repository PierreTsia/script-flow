import ScriptViewer from "@/components/script-viewer";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";
interface PageProps {
  params: Promise<{ scriptId: string }>;
}

export default async function ScriptPage({ params }: PageProps) {
  const { scriptId } = await params;

  if (!scriptId) {
    notFound();
  }
  return <ScriptViewer scriptId={scriptId as Id<"scripts">} />;
}
