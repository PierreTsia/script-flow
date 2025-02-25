const SCHEMA_DEFINITION = `{
  "scene_number": string,
  "summary": string,
  "characters": [{
    "name": string,
    "type": "PRINCIPAL" | "SUPPORTING" | "FEATURED_EXTRA" | "SILENT_KEY" | "ATMOSPHERE",
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

const CHARACTER_CLASSIFICATION_RULES = `
- Character Classification Rules:
  - ALWAYS classify characters in the same language as the input text
  - PRINCIPAL: 
    • Multiple speaking lines in the scene
    • Drives scene's action/decisions
    • Referred to by name by other characters
    
  - SUPPORTING: 
    • Has at least one speaking line
    • Interacts directly with PRINCIPAL characters
    • Has character-specific actions
    
  - FEATURED_EXTRA: 
    • 0-1 speaking lines
    • Serves specific function (e.g., "Waitress")
    • Has described actions but minimal plot impact
    
  - SILENT_KEY: 
    • No dialogue
    • Specifically named or described
    • Presence/actions affect the scene
    
  - ATMOSPHERE: 
    • No individual actions
    • Part of groups/crowd descriptions
    • Generic references (e.g., "pedestrians", "customers")`;

const ENTITY_RULES = `
- Scene number: Extract from text patterns like "3. PLACE..." → "3"
- Summary: Summarize the scene in max 2 sentences - ALWAYS IN THE LANGUAGE OF THE TEXT
- Locations: Split combined descriptors (e.g. "EXT/JOUR" → type=EXT, time_of_day=DAY)
- Language: Preserve original language terms (e.g. "ballon" not "football")
`;

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


  - Attribution Rules:
    - If a prop is closely related to a character, it should be mentioned in the prop name 
    ie "Marie lit un sms sur son téléphone" → {"name": "téléphone portable de Marie", "type": "ACTIVE", "quantity": 1, "notes": "Marie lit un sms"}
 

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

⚠️ CRITICAL LANGUAGE RULE ⚠️
- You MUST detect the input text language
- You MUST write the summary in THE SAME LANGUAGE as the input text
- Example: French input → French summary
- Example: English input → English summary

1. Identify ALL speaking characters (full names)
2. List physical props relevant to production
3. Specify exact locations with INT/EXT prefixes
4. Extract scene number from text
5. Summarize the scene in max 2 sentences - STRICTLY IN THE SAME LANGUAGE AS INPUT

# Requirements
- Output JSON matching this schema:
${SCHEMA_DEFINITION}
${JSON_RULES}

# Rules
${ENTITY_RULES}
${PROP_RULES}
${CHARACTER_CLASSIFICATION_RULES}

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
    {"name": "Mac", "type": "PRINCIPAL", "notes": "40s, focused action with prop"},
    {"name": "Pool Player 1", "type": "ATMOSPHERE", "notes": "background activity"},
    {"name": "Pool Player 2", "type": "ATMOSPHERE", "notes": "background activity"}
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
  "summary": "Audebert lit une lettre dans la cagna. Une silhouette mystérieuse l'observe depuis la porte.",
  "characters": [
    {"name": "Audebert", "type": "PRINCIPAL", "notes": "action centrale avec la lettre"},
    {"name": "Silhouette", "type": "SILENT_KEY", "notes": "présence mystérieuse, pas de dialogue mais impact sur la scène"}
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
ALEX (30s) sits on a bench, reading a newspaper. "Beautiful day," he says to no one in particular. 
A JOGGER (20s, female) stops nearby. "Hey Alex, haven't seen you in ages!" She sits next to him.
A HOT DOG VENDOR calls out "Get your hot dogs!" while serving customers. 
A SECURITY GUARD stands silently by the park entrance, watching the scene.
Background: CHILDREN play on swings, a COUPLE walks hand in hand, and an OLD MUSICIAN plays guitar.

Output:
{
  "scene_number": "12",
  "summary": "Alex meets a jogger in the park while various people go about their activities. A security guard maintains watch.",
  "characters": [
    {
      "name": "Alex", 
      "type": "PRINCIPAL", 
      "notes": "30s, has multiple lines, drives the scene"
    },
    {
      "name": "Jogger", 
      "type": "SUPPORTING", 
      "notes": "20s, female, interacts with Alex directly"
    },
    {
      "name": "Hot Dog Vendor", 
      "type": "FEATURED_EXTRA", 
      "notes": "has one line, specific function"
    },
    {
      "name": "Security Guard", 
      "type": "SILENT_KEY", 
      "notes": "no dialogue but specifically placed and watching"
    },
    {
      "name": "Children", 
      "type": "ATMOSPHERE", 
      "notes": "background activity"
    },
    {
      "name": "Couple", 
      "type": "ATMOSPHERE", 
      "notes": "background presence"
    },
    {
      "name": "Old Musician", 
      "type": "ATMOSPHERE", 
      "notes": "background activity"
    }
  ],
  "props": [
    {"name": "Alex's newspaper", "type": "ACTIVE", "quantity": 1, "notes": "read by Alex"},
    {"name": "bench", "type": "SET", "quantity": 1, "notes": "where Alex sits"},
    {"name": "hot dog cart", "type": "ACTIVE", "quantity": 1, "notes": "used by vendor"},
    {"name": "Old Musician's guitar", "type": "ACTIVE", "quantity": 1, "notes": "played by musician"},
    {"name": "swings", "type": "SET", "quantity": 2, "notes": "used by children"}
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
