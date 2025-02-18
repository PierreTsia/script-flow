import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CharacterType } from "@/convex/helpers";
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";
import { ConvexError } from "convex/values";
import { LocationType, TimeOfDay } from "@/convex/helpers";
import { useState } from "react";
const useSceneEntities = () => {
  const [isLoading, setIsLoading] = useState(false);
  const saveCharacterInScene = useMutation(
    api.characters.createCharacterWithScene
  );
  const deleteCharacterMutation = useMutation(api.characters.deleteCharacter);
  const saveLocationInScene = useMutation(
    api.locations.createLocationWithScene
  );

  const deduplicateCharacterMutation = useMutation(
    api.characters.deduplicateCharacter
  );

  const updateCharacterMutation = useMutation(api.characters.updateCharacter);

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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCharacter = async ({
    characterId,
  }: {
    characterId: Id<"characters">;
  }) => {
    setIsLoading(true);
    try {
      await deleteCharacterMutation({
        character_id: characterId,
      });
      toast({
        title: "Character deleted",
      });
    } catch (error) {
      if (error instanceof ConvexError) {
        toast({
          title: error.data.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deduplicateCharacter = async ({
    duplicatedCharacterId,
    targetCharacterId,
  }: {
    duplicatedCharacterId: Id<"characters">;
    targetCharacterId: Id<"characters">;
  }) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async ({
    characterId,
    updates,
  }: {
    characterId: Id<"characters">;
    updates: {
      name: string;
      type: CharacterType;
      aliases: string[];
    };
  }) => {
    try {
      await updateCharacterMutation({
        character_id: characterId,
        name: updates.name,
        type: updates.type,
        aliases: updates.aliases,
      });
      toast({
        title: "Character updated",
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

  return {
    createCharacter,
    createLocation,
    createProp,
    deduplicateCharacter,
    deleteCharacter,
    updateCharacter,
    isLoading,
  };
};

export default useSceneEntities;
