import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CharacterType } from "@/convex/helpers";
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";
import { ConvexError } from "convex/values";
import { LocationType, TimeOfDay } from "@/convex/helpers";
import { useState } from "react";
import { PropType } from "@/convex/props";

const useSceneEntities = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveCharacterInScene = useMutation(
    api.characters.createCharacterWithScene
  );

  const createCharacterMutation = useMutation(api.characters.createCharacter);

  const deleteCharacterMutation = useMutation(api.characters.deleteCharacter);

  const saveLocationInScene = useMutation(
    api.locations.createLocationWithScene
  );

  const createLocationMutation = useMutation(api.locations.createLocation);

  const deduplicateCharacterMutation = useMutation(
    api.characters.deduplicateCharacter
  );

  const updateCharacterMutation = useMutation(api.characters.updateCharacter);

  const updateLocationMutation = useMutation(api.locations.updateLocation);

  const savePropInScene = useMutation(api.props.createPropWithScene);

  const createPropMutation = useMutation(api.props.createProp);

  const deleteLocationMutation = useMutation(api.locations.deleteLocation);

  const deletePropMutation = useMutation(api.props.deleteProp);

  const updatePropMutation = useMutation(api.props.updateProp);

  const { toast } = useToast();

  const createNewCharacter = async ({
    name,
    type,
    aliases,
    scriptId,
  }: {
    name: string;
    type: CharacterType;
    aliases?: string[];
    scriptId: Id<"scripts">;
  }) => {
    setIsLoading(true);
    try {
      const characterId = await createCharacterMutation({
        name,
        type,
        aliases,
        script_id: scriptId,
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

  const addCharacterInScene = async ({
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

  const addLocationInScene = async ({
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

  const createNewLocation = async ({
    name,
    type,
    time_of_day,
    scriptId,
  }: {
    name: string;
    type: LocationType;
    time_of_day: TimeOfDay;
    scriptId: Id<"scripts">;
  }) => {
    setIsLoading(true);
    try {
      const locationId = await createLocationMutation({
        name,
        type,
        time_of_day,
        script_id: scriptId,
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

  const deleteLocation = async ({
    locationId,
  }: {
    locationId: Id<"locations">;
  }) => {
    setIsLoading(true);
    try {
      await deleteLocationMutation({
        location_id: locationId,
      });
      toast({
        title: "Location deleted",
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

  const updateLocation = async ({
    locationId,
    updates,
  }: {
    locationId: Id<"locations">;
    updates: {
      name: string;
      type: LocationType;
      time_of_day: TimeOfDay;
    };
  }) => {
    setIsLoading(true);
    try {
      await updateLocationMutation({
        location_id: locationId,
        name: updates.name,
        type: updates.type,
        time_of_day: updates.time_of_day,
      });
      toast({
        title: "Location updated",
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

  const updateProp = async ({
    propId,
    updates,
  }: {
    propId: Id<"props">;
    updates: { name: string; quantity: number };
  }) => {
    setIsLoading(true);
    try {
      await updatePropMutation({
        prop_id: propId,
        name: updates.name,
        quantity: updates.quantity,
      });
      toast({
        title: "Prop updated",
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

  const addPropInScene = async ({
    name,
    quantity,
    type,
    sceneId,
    scriptId,
    notes,
  }: {
    name: string;
    quantity: number;
    type: PropType;
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
        type,
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

  const createNewProp = async ({
    name,
    quantity,
    scriptId,
  }: {
    name: string;
    quantity: number;
    scriptId: Id<"scripts">;
  }) => {
    setIsLoading(true);
    try {
      const propId = await createPropMutation({
        name,
        quantity,
        script_id: scriptId,
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

  const deleteProp = async ({ propId }: { propId: Id<"props"> }) => {
    setIsLoading(true);
    try {
      await deletePropMutation({
        prop_id: propId,
      });
      toast({
        title: "Prop deleted",
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

  return {
    createNewCharacter,
    addCharacterInScene,
    addLocationInScene,
    addPropInScene,
    deduplicateCharacter,
    deleteCharacter,
    updateCharacter,
    deleteLocation,
    createNewLocation,
    updateLocation,
    deleteProp,
    updateProp,
    createNewProp,
    isLoading,
  };
};

export default useSceneEntities;
