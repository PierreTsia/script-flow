import { v, Infer } from "convex/values";

export const timeOfDayValidator = v.union(
  v.literal("DAY"),
  v.literal("NIGHT"),
  v.literal("DAWN"),
  v.literal("DUSK"),
  v.literal("UNSPECIFIED")
);

export type TimeOfDay = Infer<typeof timeOfDayValidator>;

export const locationTypeValidator = v.union(
  v.literal("INT"),
  v.literal("EXT")
);

export type LocationType = Infer<typeof locationTypeValidator>;

export const draftLocationsValidator = v.array(
  v.object({
    name: v.string(),
    type: locationTypeValidator,
    time_of_day: timeOfDayValidator,
    notes: v.optional(v.string()),
  })
);

export type DraftLocations = Infer<typeof draftLocationsValidator>;

export const characterTypeValidator = v.union(
  v.literal("PRINCIPAL"), // Characters who:
  // - Have multiple speaking lines in the scene
  // - Drive the scene's action/decisions
  // - Are referred to by name by other characters

  v.literal("SUPPORTING"), // Characters who:
  // - Have at least one speaking line
  // - Interact directly with PRINCIPAL characters
  // - Have character-specific actions in scene

  v.literal("FEATURED_EXTRA"), // Characters who:
  // - Have 0-1 speaking lines
  // - Serve a specific function (e.g., "Waitress", "Guard")
  // - Have described actions but don't influence plot

  v.literal("SILENT_KEY"), // Characters who:
  // - Have no dialogue
  // - Are specifically named or described
  // - Their presence/actions affect the scene

  v.literal("ATMOSPHERE") // Characters who:
  // - No individual actions described
  // - Mentioned as part of groups/crowd
  // - No specific names (e.g., "pedestrians", "customers")
);

export type CharacterType = Infer<typeof characterTypeValidator>;

export const draftCharactersValidator = v.array(
  v.object({
    name: v.string(),
    type: characterTypeValidator,
    notes: v.optional(v.string()),
  })
);

export type DraftCharacters = Infer<typeof draftCharactersValidator>;

export const draftPropsValidator = v.array(
  v.object({
    name: v.string(),
    quantity: v.number(),
    notes: v.optional(v.string()),
    type: v.optional(
      v.union(v.literal("ACTIVE"), v.literal("SET"), v.literal("TRANSFORMING"))
    ),
  })
);

export type DraftProps = Infer<typeof draftPropsValidator>;
