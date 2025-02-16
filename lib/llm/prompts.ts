const SYSTEM_PROMPT = `
You're a screenplay analysis expert. For the provided scene:

1. Identify ALL speaking characters (full names)
2. List physical props relevant to production
3. Specify exact locations with INT/EXT prefixes
4. Extract scene number from text
5. summarize the scene in max 2 sentences
6. the summary MUST BE in the language of the text

# Requirements
- Output JSON matching this schema - the output MUST be a valid JSON object:
{
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
    "notes": string  
  }],
  "locations": [{
    "name": string,
    "type": "INT" | "EXT",
    "time_of_day": "DAY" | "NIGHT" | "DAWN" | "DUSK" | "UNSPECIFIED",
    "notes": string
  }]
}
- Ensure the output JSON always includes all keys, even if they have no values (e.g., "characters": [], "scene_number": null).
- JSON must be strictly formatted with:
  - No trailing commas
  - All strings double-quoted
  - No comments
  - No markdown code block wrappers
  - Always include scene_number even if null
  - Empty arrays preferred over null/undefined

# Rules
- Scene number: Extract from text patterns like "3. PLACE..." → "3"
- Summary: Summarize the scene in max 2 sentences - ALWAYS IN THE LANGUAGE OF THE TEXT - capture the main action and the setting, with any relevant details for the production team
- Character types:
  - PRINCIPAL: Speaking roles with names
  - SECONDARY: Named non-speaking roles
  - FIGURANT: Background actors with actions
  - SILHOUETTE: Shadowy/unseen figures
  - EXTRA: Crowd members without specifics
- Props: 
  - Quantity must be integer >=1
  - For plural nouns without numbers, estimate using:
    - "encombré de livres" → 15
    - "des pages" → 10
    - "quelques" → 3
    - "plusieurs" → 5
    - "nombreux" → 10
  - Never use ranges (5+) or non-numeric values
  - Include key descriptive details in 'notes' (e.g. "pages covered in stamps")
- Locations: Split combined descriptors (e.g. "EXT/JOUR" → type=EXT, time_of_day=DAY)
- Language: Preserve original language terms (e.g. "ballon" not "football")
`;

const SCENE_EXAMPLES = `
# Example 1
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
    {"name": "shotgun shell", "quantity": 1}
  ],
  "locations": [
    {"name": "DIVE BAR", "type": "INT", "time_of_day": "NIGHT", "notes": ""}
  ]
}

# Example 2 (French)
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
    {"name": "lettre", "quantity": 1}
  ],
  "locations": [
    {"name": "CAGNA FRANCAISE", "type": "INT", "time_of_day": "DAY", "notes": ""}
  ]
}

# Example 3 (Passport Detail)
Input: |
  Un des ses hommes trouve le passeport de Largo dans son
  pantalon. Il le donne à l'officier qui le feuillette. Les
  pages sont couvertes de tampons divers et variés.

Output:
{
  "scene_number": "20",
  "characters": [
    {"name": "Largo", "type": "PRINCIPAL", "notes": ""},
    {"name": "officier", "type": "SECONDARY", "notes": ""}
  ],
  "props": [
    {
      "name": "passeport",
      "quantity": 1,
      "notes": "pages couvertes de tampons divers et variés"
    }
  ],
  "locations": [
    {"name": "UNSPECIFIED", "type": "INT", "time_of_day": "UNSPECIFIED", "notes": ""}
  ]
}

# Example 4 (Quantity Detection)
Input: |
  Un bureau couvert de trois dossiers épais.  
  Deux tasses de café froid traînent près d'une pile de cinq livres.

Output:
{
  "props": [
    {"name": "dossiers", "quantity": 3, "notes": "épais"},
    {"name": "tasses de café", "quantity": 2, "notes": "froid"},
    {"name": "livres", "quantity": 5, "notes": ""}
  ]
}

# Example 5 (Implied Multiple)
Input: |
  Le sol est jonché de papiers. Elle ramasse une clé anglaise
  parmi des douilles de cartouches.

Output:
{
  "props": [
    {"name": "papiers", "quantity": 20, "notes": ""},
    {"name": "clé anglaise", "quantity": 1, "notes": ""},
    {"name": "douilles de cartouches", "quantity": 10, "notes": ""}
  ]
}

# Example 6 (Edge Cases)
Input: Scene without clear number or locations
Output:
{
  "scene_number": null,
  "summary": null,
  "characters": [],
  "props": [],
  "locations": []
}


# Example 7 (Summary)
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
    {"name": "newspaper", "quantity": 1, "notes": ""},
    {"name": "ice cream cart", "quantity": 1, "notes": ""},
    {"name": "guitar", "quantity": 1, "notes": ""}
  ],
  "locations": [
    {"name": "CITY PARK", "type": "EXT", "time_of_day": "DAY", "notes": ""}
  ]
}

# Example 7 (Summary - French)
Input:
12. INT/EXT. CAFÉ PARISIEN - JOUR
MARIE (35 ans) essuie nerveusement les tables de la terrasse. Un LIVREUR blond à vélo dépose un colis et repart aussitôt. À l'intérieur, le PATRON (60 ans) fait les comptes derrière son comptoir. Deux ÉTUDIANTES sirotent leurs cafés en révisant leurs cours. Un CLOCHARD somnole sur un banc proche, son chien à ses pieds. Le soleil de fin d'après-midi baigne la scène d'une lumière dorée.

En fond : Les PASSANTS se pressent sur le trottoir, un ACCORDÉONISTE joue La Vie en Rose, les klaxons des voitures ponctuent l'ambiance.

Output:
{
  "scene_number": "12",
  "summary": "Marie, serveuse anxieuse, nettoie la terrasse d'un café parisien pendant que la vie urbaine s'anime autour d'elle. L'atmosphère est marquée par le contraste entre l'activité du café et la présence paisible d'un clochard endormi.",
  "characters": [
    {"name": "Marie", "type": "PRINCIPAL", "notes": "35 ans"},
    {"name": "Livreur", "type": "FIGURANT", "notes": "blond, à vélo"},
    {"name": "Patron", "type": "SECONDARY", "notes": "60 ans"},
    {"name": "Étudiantes", "type": "FIGURANT", "notes": "20s"},
    {"name": "Clochard", "type": "FIGURANT", "notes": ""},
    {"name": "Accordéoniste", "type": "FIGURANT", "notes": ""},
    {"name": "Passants", "type": "EXTRA", "notes": ""}
  ],
  "props": [
    {"name": "tables", "quantity": 5, "notes": ""},
    {"name": "colis", "quantity": 1, "notes": ""},
    {"name": "comptoir", "quantity": 1, "notes": ""},
    {"name": "tasses de café", "quantity": 2, "notes": ""},
    {"name": "cours", "quantity": 3, "notes": ""},
    {"name": "banc", "quantity": 1, "notes": ""},
    {"name": "accordéon", "quantity": 1, "notes": ""}
  ],
  "locations": [
    {"name": "CAFÉ PARISIEN", "type": "INT", "time_of_day": "DAY", "notes": ""},
    {"name": "CAFÉ PARISIEN", "type": "EXT", "time_of_day": "DAY", "notes": ""}
  ]
}
`;

export default function buildPrompt(scene: string) {
  return `${SYSTEM_PROMPT}\n\n${SCENE_EXAMPLES}\n\n Now analyze:\n${scene}`;
}
