import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useMemo } from "react";
import debounce from "lodash.debounce";
import { GlobalSearchEntitiesResult } from "@/convex/search";
import { isCharacter, isLocation, isProp, isScene } from "@/convex/search";
export const useSearchEntities = (scriptId?: Id<"scripts">) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  // Debounce the search to avoid hammering the backend
  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedTerm(term);
      }, 300),
    [setDebouncedTerm]
  );

  // Update search term and trigger debounced search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  // Only query if we have both a script ID and a search term
  const results = useQuery(
    api.search.searchEntities,
    debouncedTerm.length > 0
      ? {
          script_id: scriptId,
          searchTerm: debouncedTerm,
          limit: 10,
        }
      : "skip"
  );

  // Type guards for different entity types
  const isCharacterResult = (result: GlobalSearchEntitiesResult[number]) =>
    result.entityType === "character";
  const isLocationResult = (result: GlobalSearchEntitiesResult[number]) =>
    result.entityType === "location";
  const isPropResult = (result: GlobalSearchEntitiesResult[number]) =>
    result.entityType === "prop";
  const isSceneResult = (result: GlobalSearchEntitiesResult[number]) =>
    result.entityType === "scene";

  return {
    results,
    searchTerm,
    handleSearch,
    isLoading: results === undefined && debouncedTerm.length > 0,
    // Helper functions to filter results by type
    getCharacterResults: () => results?.filter(isCharacterResult) ?? [],
    getLocationResults: () => results?.filter(isLocationResult) ?? [],
    getPropResults: () => results?.filter(isPropResult) ?? [],
    getSceneResults: () => results?.filter(isSceneResult) ?? [],
  };
};
