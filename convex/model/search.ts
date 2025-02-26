import { Doc } from "../_generated/dataModel";

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const generateSearchText = {
  scene: (
    scene: Pick<
      Doc<"scenes">,
      "scene_number" | "page_number" | "text" | "summary"
    >
  ) => {
    return normalizeText(
      [
        `scene ${scene.scene_number}`,
        `page ${scene.page_number}`,
        scene.text,
        scene.summary || "",
      ].join(" ")
    );
  },

  location: (
    location: Pick<Doc<"locations">, "name" | "type" | "time_of_day">
  ) => {
    return normalizeText(
      [location.name, location.type, location.time_of_day].join(" ")
    );
  },

  prop: (prop: Pick<Doc<"props">, "name" | "type" | "quantity">) => {
    return normalizeText(
      [prop.name, prop.type, `quantity ${prop.quantity}`].join(" ")
    );
  },

  character: (
    character: Pick<Doc<"characters">, "name" | "aliases" | "type">
  ) => {
    return normalizeText(
      [character.name, ...(character.aliases || []), character.type].join(" ")
    );
  },
};
