import { Doc } from "../_generated/dataModel";

export const generateSearchText = {
  scene: (
    scene: Pick<
      Doc<"scenes">,
      "scene_number" | "page_number" | "text" | "summary"
    >
  ) => {
    return [
      `scene ${scene.scene_number}`,
      `page ${scene.page_number}`,
      scene.text,
      scene.summary || "",
    ]
      .join(" ")
      .toLowerCase();
  },

  location: (
    location: Pick<Doc<"locations">, "name" | "type" | "time_of_day">
  ) => {
    return [location.name, location.type, location.time_of_day]
      .join(" ")
      .toLowerCase();
  },

  prop: (prop: Pick<Doc<"props">, "name" | "type" | "quantity">) => {
    return [prop.name, prop.type, `quantity ${prop.quantity}`]
      .join(" ")
      .toLowerCase();
  },

  character: (
    character: Pick<Doc<"characters">, "name" | "aliases" | "type">
  ) => {
    return [character.name, ...(character.aliases || []), character.type]
      .join(" ")
      .toLowerCase();
  },
};
