"use client";

import useCharacter from "@/hooks/useCharacter";
import { Id } from "@/convex/_generated/dataModel";

interface CharacterDetailProps {
  characterId: Id<"characters">;
}

export function CharacterDetail({ characterId }: CharacterDetailProps) {
  const character = useCharacter(characterId);

  if (!character) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {character.name || "Unnamed Character"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Character-specific layout and fields */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Character Details</h2>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                Type: {character.type || "Unspecified"}
              </p>
              <p className="text-sm text-muted-foreground">
                Aliases: {character.aliases?.join(", ") || "Unspecified"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Scene Appearances</h2>
            {/* Character-specific scene list */}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Relationships</h2>
            {/* Character-specific relationships */}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Character Arc</h2>
            {/* Character development notes */}
          </div>
        </div>
      </div>
    </div>
  );
}
