import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CharacterType } from "@/convex/helpers";
import { useMutation } from "convex/react";
const useSceneEntities = (scriptId: Id<"scripts">) => {
  const insertCharacter = useMutation(api.characters.create);

  const createCharacter = async (
    sceneId: Id<"scenes">,
    name: string,
    type: CharacterType,
    aliases?: string[],
    notes?: string
  ) => {
    const characterId = await insertCharacter({
      script_id: scriptId,
      scene_id: sceneId,
      name,
      type,
      aliases,
      notes,
    });
    return characterId;
  };

  return { createCharacter };
};

export default useSceneEntities;
