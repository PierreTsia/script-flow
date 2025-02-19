import ScriptViewer from "@/components/script-viewer";
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
      <ScriptViewer scriptId={scriptId} />
    </ClientPageWrapper>
  );
};

export default Page;
