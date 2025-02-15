import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CharacterType } from "@/convex/helpers";
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";
import { ConvexError } from "convex/values";

const useSceneEntities = () => {
  const create = useMutation(api.characters.createCharacterWithScene);
  const { toast } = useToast();

  const createCharacter = async ({
    name,
    type,
    aliases,
    notes,
    sceneId,
    scriptId,
  }: {
    name: string;
    type: CharacterType;
    aliases?: string[];
    notes?: string;
    sceneId: Id<"scenes">;
    scriptId: Id<"scripts">;
  }) => {
    console.log("createCharacter", {
      name,
      type,
      aliases,
      notes,
      sceneId,
      scriptId,
    });
    try {
      const characterId = await create({
        name,
        type,
        script_id: scriptId,
        aliases,
        notes,
        scene_id: sceneId,
      });
      return characterId;
    } catch (error) {
      if (error instanceof ConvexError) {
        toast({
          title: error.data.message,
          variant: "destructive",
        });
      }
      return null;
    }
  };

  return { createCharacter };
};

export default useSceneEntities;
