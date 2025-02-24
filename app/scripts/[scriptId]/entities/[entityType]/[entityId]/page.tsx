import { notFound } from "next/navigation";
import { CharacterDetail } from "@/components/character-detail";
import { LocationDetail } from "@/components/location-detail";
import { PropDetail } from "@/components/prop-detail";
import { SceneDetail } from "@/components/scene-detail";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: Promise<{ entityType: string; entityId: string }>;
}

export default async function EntityDetailPage({ params }: PageProps) {
  const { entityType, entityId } = await params;

  switch (entityType) {
    case "characters":
      return <CharacterDetail characterId={entityId as Id<"characters">} />;
    case "locations":
      return <LocationDetail locationId={entityId as Id<"locations">} />;
    case "props":
      return <PropDetail propId={entityId as Id<"props">} />;
    case "scenes":
      return <SceneDetail sceneId={entityId as Id<"scenes">} />;
    default:
      notFound();
  }
}
