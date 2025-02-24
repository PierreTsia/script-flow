import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const useCharacter = (characterId: Id<"characters">) => {
  const character = useQuery(api.characters.getCharacterById, {
    character_id: characterId,
  });

  return character;
};

export default useCharacter;
