# Backend Documentation

## 1. Architecture Overview (Simplified)
A streamlined backend architecture:
1. **React Frontend** 
   - Uses auto-generated Convex hooks (`useQuery/useMutation`)
   - Directly calls backend operations
   - Manages local state

2. **Convex Backend** (Full-stack TypeScript)
   - Contains all business logic
   - Handles auth, database, and real-time updates
   - Directly integrates with AI services/storage

## 2. Technical Stack
### Core Platform
- **Convex**: Full-stack TypeScript platform
  - Real-time database with automatic reactivity
  - Built-in auth integration (Auth0, Clerk, etc)
  - File storage and AI capabilities
  - Type-safe client hooks generation

- **React**: Frontend library
  - Uses `useQuery`/`useMutation` for data fetching
  - Automatic UI updates on data changes

### Database Schema
```typescript
interface Script {
  id: Id<"scripts">
  userId: string
  name: string
  uploadedAt: number
  fileId: string
  metadata: {
    pageCount: number
    version?: string
    status: "processing" | "ready" | "error"
    lastModified: number
  }
  // should probably not be in the script table, but the result of a composite query
  entities: {
    characters: Id<"characters">[]
    props: Id<"props">[]
    costumes: Id<"costumes">[]
    locations: Id<"locations">[]
  }
}

type CharacterType = "PRINCIPAL" | "SECONDARY" | "FIGURANT" | "SILHOUETTE" | "EXTRA"

interface Character {
  id: Id<"characters">
  scriptId: Id<"scripts">
  primaryName: string
  aliases: string[]
  type: CharacterType
  firstAppearance: number
  notes?: string
}

interface Prop {
  id: Id<"props">
  scriptId: Id<"scripts">
  name: string
  aliases: string[]
  category?: string
  quantity: number = 1    // Default to 1 if not specified
  notes?: string
}

interface Location {
  id: Id<"locations">
  scriptId: Id<"scripts">
  name: string
  address?: string
  coordinates?: {
    lat: number
    lng: number
  }
  notes?: string
}

interface Scene {
  id: Id<"scenes">
  scriptId: Id<"scripts">
  content: string
  elements: {
    characters: {
      characterId: Id<"characters">
      mentionedAs: string    // The actual text used in scene
    }[]
    props: {
      propId: Id<"props">
      mentionedAs: string
    }[]
    // Similar structure for costumes and locations
  }
  metadata: {
    pageNumber: number
    location: {
      locationId: Id<"locations">
      type: "INT" | "EXT"
      timeOfDay?: "DAY" | "NIGHT" | "DAWN" | "DUSK"
    }
    selectionCoordinates?: {
      x1: number, y1: number,
      x2: number, y2: number
    }
  }
}
```

## 3. Core Functions

### Phase 1 - Initial Flow (Bare Minimum)
#### Queries
- `getScript`: Fetch script metadata and scenes
- `getSceneBreakdown`: Get detailed breakdown for a scene

#### Mutations
- `uploadScript`: Handle new script uploads
- `deleteScript`: Remove script and cascade delete all related entities
- `createSceneFromSelection`: Create new scene from PDF selection with its entities

#### Actions
- `analyzeScene`: Process scene text with AI and return proposed entities JSON

### Phase 2 - MVP Completion
#### Queries
- `listScripts`: Get all uploaded scripts
- `getCharacters`: List all characters in a script
- `getProps`: List all props in a script
- `getLocations`: List all locations

#### Mutations
- `createCharacter`: Create new character
- `createProp`: Create new prop
- `createLocation`: Create new location
- `updateCharacter`: Edit character details
- `updateProp`: Edit prop details
- `updateLocation`: Edit location details
- `deleteCharacter`: Cascade delete character and its scene references
- `deleteProp`: Cascade delete prop and its scene references
- `deleteLocation`: Cascade delete location and its scene references
- `linkEntityToScene`: Add entity to scene
- `unlinkEntityFromScene`: Remove entity from scene
- `updateSceneBreakdown`: Update scene elements

### Phase 3 - First Iteration (Enhanced Features)
#### Queries
- `searchScenes`: Find scenes by content/elements
- `getScriptStats`: Get breakdown counts and totals

#### Mutations
- `updateCharacter`: Edit character details
- `updateProp`: Edit prop details
- `updateLocation`: Edit location details
- `deleteScene`: Remove a scene

#### Actions
- `exportBreakdown`: Generate reports

### Phase 4 - Advanced Features
#### Mutations
- `mergeEntities`: Combine semantically similar entities of the same type

#### Actions
- `findSimilarEntities`: Compare new entity against existing ones of same type

## 4. AI Integration
- Scene element detection using AI models
- Real-time processing of selected text
- Confidence scoring for detected elements

## 5. Data Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant C as Convex
    participant AI as AI Service
    
    U->>F: Upload PDF
    F->>C: uploadScript()
    Note over C: Stores PDF file<br/>Creates script record
    C-->>F: scriptId
    
    F-->>U: Display PDF
    
    U->>F: Select Scene Text
    F->>AI: analyzeScene()
    AI-->>F: Proposed Entities JSON
    
    F->>U: Display for Review
    
    U->>F: Confirm/Edit
    F->>C: createSceneWithEntities()
    Note over C: Creates scene record<br/>Links entities
    C-->>F: Scene + Entities
    F-->>U: Show Breakdown
```

## 6. Security Considerations
```typescript
// convex/auth.ts
export const assertScriptAccess = async (ctx: QueryCtx, scriptId: Id<"scripts">) => {
  const script = await ctx.db.get(scriptId)
  const userId = (await getAuth(ctx)).userId
  
  if (!script || script.userId !== userId) {
    throw new Error('Access denied')
  }
}

// Example usage in script query
export const getScript = query({
  handler: async (ctx, { scriptId }) => {
    await assertScriptAccess(ctx, scriptId)
    return ctx.db.get(scriptId)
  }
})
```

### Access Control Flow
1. Frontend passes script ID
2. Backend verifies user owns script via `assertScriptAccess`
3. All subsequent operations inherit this permission check

### Updated Phase 1 Mutation
```typescript
export const uploadScript = internalMutation({
  handler: async (ctx, { name, fileId }) => {
    const auth = getAuth(ctx)
    if (!auth.userId) throw new Error('Unauthorized')
    
    return ctx.db.insert("scripts", {
      userId: auth.userId, // Store owner
      name,
      fileId,
      uploadedAt: Date.now(),
      metadata: { /* ... */ }
    })
  }
})

## 7. API Routes Structure

*For full endpoint specifications including request/response formats, see [API Documentation](./api.md).*

```typescript
/app
└── api
    ├── scripts
    │   ├── route.ts              // Implements Phase 1 POST/Phase 2 GET
    │   └── [scriptId]
    │       ├── route.ts          // Phase 1: GET/DELETE
    │       └── characters.ts     // Phase 2: GET: list script characters
    │   ├── props.ts          // Phase 2: GET: list script props
    │   ├── locations.ts      // Phase 2: GET: list script locations
    │   └── stats.ts          // Phase 3: GET: script statistics
    │
    ├── scenes
    │   ├── route.ts              // Phase 1: POST: create scene
    │   ├── analyze.ts            // Phase 1: POST: AI analysis
    │   └── [sceneId]
    │       ├── route.ts          // Phase 2: GET/PUT/DELETE
    │       └── entities.ts       // Phase 2: POST: link, DELETE: unlink
    │
    ├── entities
    │   ├── route.ts              // Phase 2: POST: create entity
    │   ├── similar.ts            // Phase 4: POST: find similar
    │   └── [entityId]
    │       ├── route.ts          // Phase 2: GET/PUT/DELETE
    │       └── merge.ts          // Phase 4: POST: merge with another
    │
    └── exports
        └── route.ts              // Phase 3: GET: generate breakdown export
```

### API Routes Summary by Phase

#### Phase 1 (Initial Flow)
- `POST /api/scripts` - Upload new script
- `GET /api/scripts/[id]` - Get script details
- `DELETE /api/scripts/[id]` - Delete script
- `POST /api/scenes` - Create new scene
- `POST /api/scenes/analyze` - Analyze scene text

#### Phase 2 (MVP Completion)
- `GET /api/scripts` - List all scripts
- `GET /api/scripts/[id]/characters` - List script characters
- `GET /api/scripts/[id]/props` - List script props
- `GET /api/scripts/[id]/locations` - List script locations
- `GET/PUT/DELETE /api/scenes/[id]` - Scene management
- `POST/DELETE /api/scenes/[id]/entities` - Entity linking
- `POST /api/entities` - Create new entity
- `GET/PUT/DELETE /api/entities/[id]` - Entity management

#### Phase 3 (Enhanced Features)
- `GET /api/scripts/[id]/stats` - Get script statistics
- `GET /api/exports` - Generate breakdown export

#### Phase 4 (Advanced Features)
- `POST /api/entities/similar` - Find similar entities
- `POST /api/entities/[id]/merge` - Merge with another entity 