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
  const { entityType, entityId, scriptId } = params;

  switch (entityType) {
    case "characters":
      return (
        <CharacterDetail
          characterId={entityId as Id<"characters">}
          scriptId={scriptId}
        />
      );
    case "locations":
      return (
        <LocationDetail
          locationId={entityId as Id<"locations">}
          scriptId={scriptId}
        />
      );
    case "props":
      return (
        <PropDetail propId={entityId as Id<"props">} scriptId={scriptId} />
      );
    case "scenes":
      return (
        <SceneDetail sceneId={entityId as Id<"scenes">} scriptId={scriptId} />
      );
    default:
      notFound();
  }
}
