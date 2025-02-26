import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import CharactersTabContent from "@/components/script-entities-screen/characters-tab-content";
import LocationsTabContent from "@/components/script-entities-screen/locations-tab-content";
import PropsTabContent from "@/components/script-entities-screen/props-tab-content";
import ScenesTabContent from "@/components/script-entities-screen/scenes-tab-content";
import { ClientPageWrapper } from "@/components/client-page-wrapper";
interface PageProps {
  params: { scriptId: Id<"scripts">; entityType: string };
}

export default async function EntityTypePage({ params }: PageProps) {
  const { scriptId, entityType } = await params;

  switch (entityType) {
    case "characters":
      return (
        <ClientPageWrapper scriptId={scriptId}>
          <CharactersTabContent scriptId={scriptId} />
        </ClientPageWrapper>
      );
    case "locations":
      return (
        <ClientPageWrapper scriptId={scriptId}>
          <LocationsTabContent scriptId={scriptId} />
        </ClientPageWrapper>
      );
    case "props":
      return (
        <ClientPageWrapper scriptId={scriptId}>
          <PropsTabContent scriptId={scriptId} />
        </ClientPageWrapper>
      );
    case "scenes":
      return (
        <ClientPageWrapper scriptId={scriptId}>
          <ScenesTabContent scriptId={scriptId} />
        </ClientPageWrapper>
      );
    default:
      notFound();
  }
}
