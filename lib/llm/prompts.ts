const SCHEMA_DEFINITION = `{
  "scene_number": string,
  "summary": string,
  "characters": [{
    "name": string,
    "type": "PRINCIPAL" | "SECONDARY" | "FIGURANT" | "SILHOUETTE" | "EXTRA",
    "notes": string
  }],
  "props": [{
    "name": string,
    "quantity": number,
    "type": "ACTIVE" | "SET" | "TRANSFORMING",
    "notes": string  
  }],
  "locations": [{
    "name": string,
    "type": "INT" | "EXT",
    "time_of_day": "DAY" | "NIGHT" | "DAWN" | "DUSK" | "UNSPECIFIED",
    "notes": string
  }]
}`;

const JSON_RULES = `
- Ensure the output JSON always includes all keys, even if they have no values (e.g., "characters": [], "scene_number": null).
- JSON must be strictly formatted with:
  - No trailing commas
  - All strings double-quoted
  - No comments
  - No markdown code block wrappers
  - Always include scene_number even if null
  - Empty arrays preferred over null/undefined`;

const ENTITY_RULES = `
- Scene number: Extract from text patterns like "3. PLACE..." → "3"
- Summary: Summarize the scene in max 2 sentences - ALWAYS IN THE LANGUAGE OF THE TEXT
- Character types:
  - PRINCIPAL: Speaking roles with names
  - SECONDARY: Named non-speaking roles
  - FIGURANT: Background actors with actions
  - SILHOUETTE: Shadowy/unseen figures
  - EXTRA: Crowd members without specifics`;

const PROP_RULES = `
- Props Classification:
  - NEVER classify humans, characters, or living beings as props
  - Only classify physical objects and set pieces

  1. ACTIVE Props:
     - Physical objects directly handled/manipulated by characters
     - Items specifically mentioned in character actions
     - Example: "John picks up the COFFEE MUG" → type: "ACTIVE"

  2. SET Props:
     - Static background elements worth tracking
     - Furniture and decorative items
     - Example: "The walls are covered with PAINTINGS" → type: "SET"

  3. TRANSFORMING Props:
     - Items that change state during scene
     - Set pieces that become interactive
     - Example: "CURTAINS she later tears down" → type: "TRANSFORMING"

  - Exclusions:
    - Characters, people, or living beings
    - Abstract concepts
    - Weather or natural phenomena
    - Implied items not explicitly mentioned

  - Quantity Rules:
    - Must be integer >=1
    - For plural nouns without numbers, estimate using:
      - "encombré de livres" → 15
      - "des pages" → 10
      - "quelques" → 3
      - "plusieurs" → 5
      - "nombreux" → 10

  - Notes field must include:
    - For ACTIVE: interaction context
    - For SET: location/placement details
    - For TRANSFORMING: state changes`;

const SYSTEM_PROMPT = `
You're a screenplay analysis expert. For the provided scene:

1. you should ALWAYS ANSWER in the language of the text
2. Identify ALL speaking characters (full names)
3. List physical props relevant to production
4. Specify exact locations with INT/EXT prefixes
5. Extract scene number from text
6. summarize the scene in max 2 sentences - ALWAYS IN THE LANGUAGE OF THE TEXT

# Requirements
- Output JSON matching this schema:
${SCHEMA_DEFINITION}
${JSON_RULES}

# Rules
${ENTITY_RULES}
${PROP_RULES}
- Locations: Split combined descriptors (e.g. "EXT/JOUR" → type=EXT, time_of_day=DAY)
- Language: Preserve original language terms (e.g. "ballon" not "football")
`;

const BASIC_EXAMPLES = `
# Example 1 (Basic Scene)
Input: 
3. INT. DIVE BAR - NIGHT  
MAC (40s) polishes a shotgun shell.  
Background: two men play pool.

Output:
{
  "scene_number": "3",
  "characters": [
    {"name": "Mac", "type": "PRINCIPAL", "notes": "40s"},
    {"name": "man 1", "type": "FIGURANT", "notes": ""},
    {"name": "man 2", "type": "FIGURANT", "notes": ""}
  ],
  "props": [
    {"name": "shotgun shell", "quantity": 1, "type": "ACTIVE", "notes": "polished by Mac"}
  ],
  "locations": [
    {"name": "DIVE BAR", "type": "INT", "time_of_day": "NIGHT", "notes": ""}
  ]
}`;

const MULTILINGUAL_EXAMPLES = `
# Example (French)
Input:
32 CAGNA FRANCAISE - INT - JOUR 32
AUDEBERT lit une LETTRE. Une SILHOUETTE observe depuis la porte.

Output:
{
  "scene_number": "32",
  "characters": [
    {"name": "Audebert", "type": "PRINCIPAL", "notes": ""},
    {"name": "Silhouette", "type": "SILHOUETTE", "notes": ""}
  ],
  "props": [
    {"name": "lettre", "quantity": 1, "type": "ACTIVE", "notes": "lue par Audebert"}
  ],
  "locations": [
    {"name": "CAGNA FRANCAISE", "type": "INT", "time_of_day": "DAY", "notes": ""}
  ]
}`;

const PROP_COUNTING_EXAMPLES = `
# Example (Props Types & Quantity)
Input: |
  Un bureau couvert de trois dossiers épais. Marie saisit une des deux tasses de café froid qui 
  traînent près d'une pile de cinq livres. Elle tire violemment la nappe, faisant tomber tout ce qui 
  se trouve sur la table.

Output:
{
  "props": [
    {
      "name": "dossiers",
      "type": "SET",
      "quantity": 3,
      "notes": "épais, sur le bureau"
    },
    {
      "name": "tasses de café",
      "type": "ACTIVE",
      "quantity": 2,
      "notes": "froid, une saisie par Marie"
    },
    {
      "name": "livres",
      "type": "SET",
      "quantity": 5,
      "notes": "empilés près des tasses"
    },
    {
      "name": "nappe",
      "type": "TRANSFORMING",
      "quantity": 1,
      "notes": "tirée violemment, fait tomber les objets"
    },
    {
      "name": "bureau",
      "type": "SET",
      "quantity": 1,
      "notes": "couvert de dossiers"
    }
  ]
}

# Example (Mixed Interactions)
Input: |
  Dans le salon, un vieux piano couvert de cadres photos. Tom s'assoit et commence à jouer. 
  Sur une étagère, plusieurs trophées poussiéreux. Il en prend un et le lance par la fenêtre.

Output:
{
  "props": [
    {
      "name": "piano",
      "type": "TRANSFORMING",
      "quantity": 1,
      "notes": "vieux, devient instrument joué par Tom"
    },
    {
      "name": "cadres photos",
      "type": "SET",
      "quantity": 5,
      "notes": "sur le piano"
    },
    {
      "name": "trophées",
      "type": "ACTIVE",
      "quantity": 3,
      "notes": "poussiéreux, un lancé par la fenêtre"
    },
    {
      "name": "étagère",
      "type": "SET",
      "quantity": 1,
      "notes": "support des trophées"
    }
  ]
}`;

const EDGE_CASE_EXAMPLES = `
# Example (Edge Cases)
Input: Scene without clear number or locations
Output:
{
  "scene_number": null,
  "summary": null,
  "characters": [],
  "props": [],
  "locations": []
}`;

const COMPLEX_SCENE_EXAMPLES = `
# Example (Complex Scene)
Input:
 12. EXT. CITY PARK - DAY
ALEX (30s) sits on a bench, reading a newspaper. A DOG runs up to him, wagging its tail. Nearby, a JOGGER (20s) stops to tie her shoelaces. CHILDREN play on the swings, laughing loudly. A VENDOR pushes a cart, selling ice cream to a line of eager customers. The sun shines brightly, casting long shadows on the ground. A BIRD lands on the bench next to Alex, pecking at crumbs.

Background: A couple walks hand in hand, a cyclist zooms past, and a street musician plays a cheerful tune on his guitar.

Output:
{
  "scene_number": "12",
  "summary": "Alex reads on a park bench as a dog approaches. The park is lively with children playing, a vendor selling ice cream, and a musician playing guitar.",
  "characters": [
    {"name": "Alex", "type": "PRINCIPAL", "notes": "30s"},
    {"name": "dog", "type": "FIGURANT", "notes": ""},
    {"name": "jogger", "type": "FIGURANT", "notes": "20s"},
    {"name": "vendor", "type": "FIGURANT", "notes": ""},
    {"name": "children", "type": "EXTRA", "notes": ""},
    {"name": "couple", "type": "EXTRA", "notes": ""},
    {"name": "cyclist", "type": "EXTRA", "notes": ""},
    {"name": "musician", "type": "FIGURANT", "notes": ""}
  ],
  "props": [
    {
      "name": "newspaper",
      "type": "ACTIVE",
      "quantity": 1,
      "notes": "read by Alex"
    },
    {
      "name": "bench",
      "type": "SET",
      "quantity": 1,
      "notes": "where Alex is sitting"
    },
    {
      "name": "ice cream cart",
      "type": "ACTIVE",
      "quantity": 1,
      "notes": "pushed by the vendor"
    },
    {
      "name": "guitar",
      "type": "ACTIVE",
      "quantity": 1,
      "notes": "played by the street musician"
    },
    {
      "name": "swings",
      "type": "ACTIVE",
      "quantity": 2,
      "notes": "used by the children"
    },
    {
      "name": "shoelaces",
      "type": "ACTIVE",
      "quantity": 2,
      "notes": "tied by the jogger"
    },
    {
      "name": "crumbs",
      "type": "SET",
      "quantity": 1,
      "notes": "on the bench, picked by the bird"
    }
  ],
  "locations": [
    {"name": "CITY PARK", "type": "EXT", "time_of_day": "DAY", "notes": ""}
  ]
}`;

const SCENE_EXAMPLES = `
${BASIC_EXAMPLES}
${MULTILINGUAL_EXAMPLES}
${PROP_COUNTING_EXAMPLES}
${EDGE_CASE_EXAMPLES}
${COMPLEX_SCENE_EXAMPLES}`;

export default function buildPrompt(scene: string) {
  return `${SYSTEM_PROMPT}\n\n${SCENE_EXAMPLES}\n\n Now analyze:\n${scene}`;
}
