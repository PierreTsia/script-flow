import { notFound } from "next/navigation";
import { CharacterDetail } from "@/components/character-detail";
import { LocationDetail } from "@/components/location-detail";
import { PropDetail } from "@/components/prop-detail";
import { SceneDetail } from "@/components/scene-detail";
import { Id } from "@/convex/_generated/dataModel";

interface PageProps {
  params: {
    scriptId: Id<"scripts">;
    entityType: "characters" | "locations" | "props" | "scenes";
    entityId: string;
  };
}

export default function EntityDetailPage({ params }: PageProps) {
  const { entityType, entityId } = params;

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
