import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { characterTypeValidator } from "./helpers";

const createCharacterValidator = v.object({
  script_id: v.id("scripts"),
  name: v.string(),
  type: characterTypeValidator,
  aliases: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  scene_id: v.id("scenes"),
});

export const create = mutation({
  args: createCharacterValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const characterId = await ctx.db.insert("characters", {
      ...args,
      searchText:
        [args.name, ...(args.aliases || [])].join(" ").toLowerCase() +
        ` ${args.type}`,
    });

    return characterId;
  },
});
