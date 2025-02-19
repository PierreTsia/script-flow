import { notFound, redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
interface PageProps {
  params: Promise<{ scriptId: Id<"scripts"> }>;
}

export default async function ScriptPage({ params }: PageProps) {
  const { scriptId } = await params;

  if (!scriptId) {
    notFound();
  }

  redirect(`/scripts/${scriptId}/viewer`);
}
