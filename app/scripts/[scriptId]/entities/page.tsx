import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: Promise<{ scriptId: Id<"scripts"> }>;
}

export default async function EntitiesPage({ params }: PageProps) {
  const { scriptId } = await params;
  redirect(
    `/scripts/${scriptId}/entities/scenes?sortBy=scene_number&sortOrder=asc`
  );
}
