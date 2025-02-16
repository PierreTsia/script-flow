import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const createPropValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
});

const createPropWithSceneValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  quantity: v.optional(v.number()),
  notes: v.optional(v.string()),
  scene_id: v.id("scenes"),
});

export const createProp = mutation({
  args: createPropValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existingProp = await ctx.db
      .query("props")
      .withIndex("unique_prop_per_script", (q) =>
        q.eq("script_id", args.script_id).eq("name", args.name)
      )
      .first();

    if (existingProp) {
      throw new ConvexError(
        `A prop with the name "${args.name}" already exists in this script.`
      );
    }

    const quantity = args.quantity ?? 1;

    const propId = await ctx.db.insert("props", {
      script_id: args.script_id,
      name: args.name,
      quantity,
    });

    return propId;
  },
});

export const createPropWithScene = mutation({
  args: createPropWithSceneValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if the prop already exists
    let propId;
    const existingProp = await ctx.db
      .query("props")
      .withIndex("unique_prop_per_script", (q) =>
        q.eq("script_id", args.script_id).eq("name", args.name)
      )
      .first();

    if (existingProp) {
      propId = existingProp._id;
    } else {
      // Insert new prop
      const quantity = args.quantity ?? 1; // Default quantity to 1 if not provided
      const { scene_id, notes, ...propData } = args; // Extract notes
      propId = await ctx.db.insert("props", { ...propData, quantity });
    }

    // Create the junction with notes
    await ctx.db.insert("prop_scenes", {
      prop_id: propId,
      scene_id: args.scene_id,
      notes: args.notes, // Put notes here
    });

    return propId;
  },
});

export const getPropsByScriptId = query({
  args: { script_id: v.id("scripts") },
  handler: async (ctx, { script_id }) => {
    // Get all props for this script
    const props = await ctx.db
      .query("props")
      .withIndex("by_script", (q) => q.eq("script_id", script_id))
      .collect();

    // Fetch scenes for each prop
    return await Promise.all(
      props.map(async (prop) => {
        const propScenes = await ctx.db
          .query("prop_scenes")
          .withIndex("by_prop", (q) => q.eq("prop_id", prop._id))
          .collect();

        const scenes = await Promise.all(
          propScenes.map(async (ps) => {
            const scene = await ctx.db.get(ps.scene_id);
            return {
              ...scene!,
              notes: ps.notes,
            };
          })
        );

        return {
          ...prop,
          scenes,
        };
      })
    );
  },
});
