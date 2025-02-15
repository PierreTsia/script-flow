import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CharacterType } from "@/convex/helpers";
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";
import { ConvexError } from "convex/values";
import { LocationType, TimeOfDay } from "@/convex/helpers";
const useSceneEntities = () => {
  const saveCharacterInScene = useMutation(
    api.characters.createCharacterWithScene
  );
  const saveLocationInScene = useMutation(
    api.locations.createLocationWithScene
  );
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
    try {
      const characterId = await saveCharacterInScene({
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

  const createLocation = async ({
    name,
    type,
    time_of_day,
    sceneId,
    scriptId,
    notes,
  }: {
    name: string;
    type: LocationType;
    time_of_day: TimeOfDay;
    sceneId: Id<"scenes">;
    scriptId: Id<"scripts">;
    notes?: string;
  }) => {
    try {
      const locationId = await saveLocationInScene({
        name,
        type,
        time_of_day,
        script_id: scriptId,
        scene_id: sceneId,
        notes,
      });
      return locationId;
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

  return { createCharacter, createLocation };
};

export default useSceneEntities;
