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

  const deduplicateCharacterMutation = useMutation(
    api.characters.deduplicateCharacter
  );

  const savePropInScene = useMutation(api.props.createPropWithScene);

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

  const createProp = async ({
    name,
    quantity,
    sceneId,
    scriptId,
    notes,
  }: {
    name: string;
    quantity: number;
    sceneId: Id<"scenes">;
    scriptId: Id<"scripts">;
    notes?: string;
  }) => {
    try {
      const propId = await savePropInScene({
        name,
        quantity,
        script_id: scriptId,
        scene_id: sceneId,
        notes,
      });
      return propId;
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

  const deduplicateCharacter = async ({
    duplicatedCharacterId,
    targetCharacterId,
  }: {
    duplicatedCharacterId: Id<"characters">;
    targetCharacterId: Id<"characters">;
  }) => {
    try {
      await deduplicateCharacterMutation({
        duplicated_character_id: duplicatedCharacterId,
        target_character_id: targetCharacterId,
      });
      toast({
        title: "Character deduplicated",
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast({
          title: error.data.message,
          variant: "destructive",
        });
      }
    }
  };
  return { createCharacter, createLocation, createProp, deduplicateCharacter };
};

export default useSceneEntities;
