import ScriptSceneEntitiesScreen from "@/components/script-entities-screen/script-scene-entities-screen";
import { Id } from "@/convex/_generated/dataModel";

import { ClientPageWrapper } from "@/components/client-page-wrapper";
const Page = async ({
  params,
}: {
  params: Promise<{ scriptId: Id<"scripts"> }>;
}) => {
  const { scriptId } = await params;

  return (
    <ClientPageWrapper scriptId={scriptId}>
      <ScriptSceneEntitiesScreen scriptId={scriptId} />
    </ClientPageWrapper>
  );
};

export default Page;
