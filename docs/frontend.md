# Frontend Documentation

## 1. Architecture Overview
A modern, dashboard-based web application built with Next.js, focusing on professional-grade UI and efficient workflow for film production teams.

## 2. Technical Stack
### Core Framework
- **Next.js/React**: Leveraging server components and app router for optimal performance
- **TypeScript**: For type safety and better development experience

### UI Components
- **shadcn/ui**: Primary component library
- **Tailwind CSS**: Utility-first styling
- **PDFSlick**: React-optimized PDF viewer with built-in text selection and Zustand integration

## 3. Dashboard Structure

### Home Layout
```
+------------------+------------------+
|     Header       |                 |
+------------------+                 |
|                                   |
|        Upload PDF Button          |
|                                   |
|     (Recent Scripts - Phase 2)    |
|                                   |
+-----------------------------------+
```

### Script View Layout
```
All Viewports:
+----------------------------+
|         Top Bar            |
+----------------------------+
|                            |
|       Full-width PDF       |
|                            |
+----------------------------+
|  Scenes Bottom Sheet (60%) |
+----------------------------+


```

### Analysis Modal
```
+--------------------------------+
|        Analysis Modal          |
|  +----------------------------+|
|  |    Selected Text Preview   ||
|  +----------------------------+|
|  |    Detected Entities       ||
|  |  - Characters             ||
|  |  - Props                  ||
|  |  - Location               ||
|  +----------------------------+|
|  |   Confirm / Edit Actions   ||
|  +----------------------------+|
+--------------------------------+
```

### Scene Breakdown View
```
+--------------------------------+
|  Header + Back to Script       |
+--------------------------------+
|        Scene Information       |
+--------------------------------+
|                                |
|      Breakdown Grid            |
|   +----------------------+     |
|   |     Characters      |     |
|   +----------------------+     |
|   |       Props         |     |
|   +----------------------+     |
|   |      Location       |     |
|   +----------------------+     |
|                                |
+--------------------------------+
```

## 4. Core Components
1. **PDFViewer**
   - Built-in text selection and scene boundary visualization
   - Preconfigured zoom/navigation controls
   - Zustand store integration for PDF state

2. **BreakdownSheet**
   - Dynamic element categorization
   - Edit/correction interface
   - Export preview

3. **NavigationSystem**
   - Context-aware breadcrumbs
   - Quick scene switching
   - Progress indicators

## 5. State Management
- Local component state for UI interactions
- Server state for PDF processing
- Persistent state for user preferences 

## Phase 1 - Core User Journey

### 1. Home Screen (/)
```mermaid
graph TD
    subgraph HomeScreen[Home Screen]
        Upload[Upload Button - Centered]
        RecentScripts[Recent Scripts List - Empty in Phase 1]
    end
```

**What user sees:**
- Clean, centered upload button
- "Drop your script here or click to upload"
- Simple header with app name
- Empty state for recent scripts (Phase 1)

**User actions:**
- Click upload or drag & drop PDF
- → Redirects to `/scripts/[scriptId]` after upload

### 2. Script View (/scripts/[scriptId])
```mermaid
graph TD
    subgraph ScriptView[Script View]
        direction LR
        subgraph MainArea["Main Area - 70%"]
            PDF[PDF Viewer]
            Selection[Selection Tools]
            Instructions[User Instructions]
            MobileToggle[Mobile Scene Toggle]
        end
        subgraph Sidebar["Sidebar - 30% (Mobile Sheet)"]
            ScenesList[Scenes List]
            CreateNew[New Scene Button]
        end
    end
```

**What user sees** (Script View):
- **Main Area**
  - Desktop: Persistent side-by-side view
  - Mobile: Full-width PDF with floating scene toggle
  - New mobile behavior: Bottom sheet for scenes (40vh height)

- **Sidebar (30%)**
  - List of saved scenes
    - Scene number
    - First line/title
    - Quick actions (view/edit)
  - "Create New Scene" button
  - Empty state: "No scenes yet. Select text to create your first scene"

**User actions:**
- Scroll/zoom PDF
- Select text
- Click "Analyze Selection"
- Click existing scene to view its breakdown
- → Opens analysis modal for new scenes
- → Goes to /scripts/[scriptId]/scenes/[sceneId] for existing scenes

### 3. Analysis Modal (same route, modal UI)
```mermaid
graph TD
    subgraph AnalysisModal[Analysis Modal]
        Preview[Selected Text Preview]
        Results[AI Analysis Results]
        Actions[Confirm/Edit Actions]
    end
```

**What user sees:**
- Modal overlay
- Selected text preview
- AI-detected entities:
  - Characters
  - Props
  - Location
- Confirm/Edit buttons

**User actions:**
- Review AI analysis
- Edit if needed
- Confirm
- → Creates scene and shows breakdown

### 4. Scene Breakdown (/scripts/[scriptId]/scenes/[sceneId])
```mermaid
graph TD
    subgraph BreakdownView[Breakdown View]
        Header[Scene Info]
        Grid[Breakdown Grid]
        Nav[Return to Script]
    end
```

**What user sees:**
- Scene number/reference
- Organized breakdown of:
  - Characters
  - Props
  - Location
- Link back to script

**User actions:**
- Review breakdown
- Return to script for next scene

### Navigation Flow
```mermaid
graph LR
    Home["/"] -->|Upload PDF| Script["/scripts/[id]"]
    Script -->|Select Text| Analysis["Analysis Modal"]
    Script -->|Click Scene| Breakdown["/scripts/[id]/scenes/[id]"]
    Analysis -->|Confirm| Breakdown
    Breakdown -->|Back to Script| Script
``` 

## 6. Next.js Architecture

### App Router Structure
```typescript
app/
├── layout.tsx               // Root layout: theme, providers
├── page.tsx                // Home: Upload interface
│
├── scripts/
│   ├── layout.tsx          // Scripts layout: navigation
│   ├── page.tsx           // Scripts list (Phase 2)
│   │
│   └── [scriptId]/
│       ├── layout.tsx      // Script layout: sidebar
│       ├── page.tsx       // PDF viewer + scenes
│   │
│   └── scenes/
│       ├── page.tsx   // Scenes list
│       └── [sceneId]/
│           └── page.tsx // Scene breakdown
```

### Key Architectural Decisions
1. **App Router (app/)**
   - Server Components by default
   - Better streaming support
   - Intuitive layouts
   - Improved data fetching

2. **Component Strategy**
   ```typescript
   // Server Component by default
   async function ScriptViewer({ scriptId }: { scriptId: string }) {
     const script = await fetchScript(scriptId)
     return <PDFViewer script={script} />
   }

   // Client Component when needed
   'use client'
   function PDFViewer({ script }: { script: Script }) {
     // Interactive PDF functionality
   }
   ```

3. **Data Flow**
   - Server Components for data fetching
   - Client Components for interactivity
   - Route Handlers for API endpoints

4. **Layout Structure**
   ```typescript
   // app/layout.tsx
   export default function RootLayout({
     children
   }: {
     children: React.ReactNode
   }) {
     return (
       <html lang="en">
         <body>
           <ThemeProvider>
             <Navigation />
             {children}
           </ThemeProvider>
         </body>
       </html>
     )
   }
   ```

### Performance Benefits
1. Automatic code splitting
2. Server-side rendering
3. Progressive enhancement
4. Streaming for large PDFs 

## 7. Project Structure

```typescript
src/
├── app/                      // Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── scripts/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   └── [scriptId]/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       │
│   │       └── scenes/
│   │           ├── page.tsx
│   │           └── [sceneId]/
│   │               └── page.tsx
│   │
│   └── api/
│       └── scripts/
│           └── route.ts
│
├── components/             // ALL components live here
│   ├── ui/                // shadcn + basic UI
│   │   ├── button.tsx
│   │   └── dialog.tsx
│   │
│   ├── pdf-viewer.tsx
│   ├── scene-card.tsx
│   ├── scene-list.tsx
│   ├── breakdown-grid.tsx
│   ├── main-header.tsx
│   └── main-nav.tsx
│
├── lib/                   // Core utilities
│   ├── pdf.ts
│   ├── api.ts
│   └── utils.ts
│
├── hooks/                 // ALL hooks here
│   ├── use-pdf.ts
│   └── use-scene.ts
│
└── types/                 // Direct imports, no barrel
    ├── scene.ts          // Scene related types
    └── api.ts            // API types
```

### Types Usage Example

```typescript
// components/pdf-viewer.tsx
import { usePDFSlick } from "@pdfslick/react"

interface PDFViewerProps {
  url: string
  onSceneSelect: (selection: TextSelection) => void
}

// hooks/use-pdf.ts
import type { PDFDocument } from '@/types/pdf'
import type { Scene } from '@/types/scene'

export function usePDF(doc: PDFDocument): Scene {
  // ...
}

// lib/api.ts
import type { APIResponse } from '@/types/api'
import type { Scene } from '@/types/scene'

export async function getScene(id: string): Promise<APIResponse<Scene>> {
  // ...
}
``` 

## 8. Implementation Considerations

### PDFSlick Integration
```typescript
// app/scripts/[scriptId]/page.tsx
import { PDFSlickProvider } from "@pdfslick/react"

export default function ScriptPage({ params }: { params: { scriptId: string } }) {
  return (
    <PDFSlickProvider 
      url={`/api/scripts/${params.scriptId}`}
      options={{ disableTextLayer: false }}
    >
      <PDFViewer />
      <SceneSidebar />
    </PDFSlickProvider>
  )
}
```

**Key Decisions:**
1. Using PDFSlick's provider pattern for cleaner state management
2. Keeping text layer enabled for selection but style it with Tailwind
3. PDFSlick's built-in controls match our mobile breakpoints

**Tradeoffs:**
- Adds 23kb to bundle size (gzip) vs raw PDF.js
- Less low-level control than vanilla implementation
- Reliant on PDFSlick's active maintenance

### Key Changes from Phase 1:
1. Unified bottom sheet approach for all devices
2. PDF viewer uses full width regardless of viewport
3. Scenes panel becomes persistent bottom bar on desktop
4. Simplified layout hierarchy

### Tradeoffs:
- Desktop users get less vertical PDF space
- Consistent bottom-up interaction pattern
- Reduced layout complexity
- Better mobile-first experience

