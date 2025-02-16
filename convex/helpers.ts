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
  v.literal("PRINCIPAL"),
  v.literal("SECONDARY"),
  v.literal("FIGURANT"),
  v.literal("SILHOUETTE"),
  v.literal("EXTRA")
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
  })
);

export type DraftProps = Infer<typeof draftPropsValidator>;
