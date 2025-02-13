export type LLMOptions = {
  apiKey: string;
  baseURL?: string;
};

export interface LLMProvider {
  analyzeScene(text: string): Promise<string>;
}

// In a new file, e.g., lib/llm/types.ts
export interface SceneAnalysis {
  scene_number: string | null;
  characters: { name: string; type: CharacterType }[];
  props: { name: string; quantity: number; notes?: string }[];
  locations: Location[];
  pageNumber: number;
}

// You'll also need to define the CharacterType and Location types.
// You can do this in the same file or in separate files.
export type CharacterType =
  | "PRINCIPAL"
  | "SECONDARY"
  | "FIGURANT"
  | "SILHOUETTE"
  | "EXTRA";
export type LocationType = "INT" | "EXT";

export type TimeOfDay = "DAY" | "NIGHT" | "DAWN" | "DUSK" | "UNSPECIFIED";
export type Location = {
  name: string;
  type: LocationType;
  time_of_day: TimeOfDay;
};

export type Prop = {
  name: string;
  quantity: number;
  notes?: string;
};

/* 

{
    "analysis": {
        "scene_number": "1",
        "characters": [
            {
                "name": "Femme",
                "type": "PRINCIPAL"
            }
        ],
        "props": [
            {
                "name": "gobelet",
                "quantity": 1
            },
            {
                "name": "biscuit",
                "quantity": 1,
                "notes": "dans emballage plastique"
            },
            {
                "name": "café",
                "quantity": 1
            }
        ],
        "locations": [
            {
                "name": "BUREAU DE LA CITÉ JUDICIAIRE",
                "type": "INT",
                "time_of_day": "DAY"
            }
        ]
    },
    "pageNumber": 3
}*/
