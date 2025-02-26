import ScriptSceneEntitiesScreen from "@/components/script-entities-screen/script-scene-entities-screen";
import { Id } from "@/convex/_generated/dataModel";

export default async function EntityLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ scriptId: Id<"scripts"> }>;
}) {
  const { scriptId } = await params;
  return (
    <ScriptSceneEntitiesScreen scriptId={scriptId}>
      {children}
    </ScriptSceneEntitiesScreen>
  );
}
