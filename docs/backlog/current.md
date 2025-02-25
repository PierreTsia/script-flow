# Core Development Journey

## Phase Order (MVP Critical Path)

<details>
<summary>✅ Completed Phases</summary>

1. **App Foundation** (2h)
   - [x] Create Next.js app with TypeScript
   - [x] Configure ESLint + Prettier
   - [x] add remote github repo
   - [x] add base CI pipeline : lint, typecheck
   - [x] Setup basic Tailwind CSS
   - [x] shadcn/ui + theme
   - [x] dark mode / light mode toggle
   - [x] Install next-intl (i18n skeleton)
   - [x] add locale switcher
   - [x] deploy to vercel
   **Files:** `package.json`, `tsconfig.json`, `.eslintrc`, `.prettierrc`, `src/middleware.ts`

2. **Authentication** (4h)
   - [x] Clerk basic integration
   - [x] Protected routes (/scripts)
   - [x] User state sync with Convex - TODO: add Convex
   **Files:** `src/auth.ts`, `src/middleware.ts`, `src/app/layout.tsx`

3. **Database Setup** (3h)
   - [x] Convex project initialization with mock getTasks
   - [x] Script/Scene schema definition
   - [x] Basic CRUD operations
   - [x] clerck/convex provider
   **Files:** `convex/`, `.env`, `src/convex/`

4. **PDF Core 1** (6h)
   - [x] basic / home page UI with upload button and script list datatable
   - [x] PDF upload functionality
   **Files:** `src/app/page.tsx`
   
5. **PDF Core 2** (6h)
   - [x] script id details page
   - [x] Pdf Slick viewer integration
   - [x] Text selection capture with page number start
   **Files:** `src/app/[scriptId]/page.tsx`

6. **AI Integration** (5h)
   - [x] create new hook 'useScene' and convex file `scenes.ts` with analyse function
   - [x] this analyse function should take the selected text and the page number 
   - [x] and then call the LLM using an http convex request (see https://docs.convex.dev/functions/http-actions)
   - [x] the call is done through the LLM provider interface => see @ai-providers.md
   - [x] Mistral API wrapper
   **Files:** `/hooks/useScene.ts`, `src/convex/scenes.ts`

   8. **Basic UI** (4h)
   - [x] Upload button
   - [x] Script view layout
   - [x] Analysis modal
   **Files:** `src/app/page.tsx`, `src/components/upload.tsx`



   7. **AI Integration 2** (5h)
   - [ ] handle preview urls cors issue (using debug logs and allowed origins)
   - [x] costs monitoring using Helidome
   - [x] persist the analysed scenes draft scenes in the database
   - [x] type the llm response better
   - [x] handle the response in the client
   - [x] fix sheet layout in mobile : select element for draft selection
   - [x] display the response as a prefilled form in the analysis block
   - [x] match the entities schema
   - [x] save the verified analysis in the database

8. **Convex improvements** (4h)
   - [x] Add pagination to large result sets:
     - [x] Scenes listing
     - [x] Characters listing
     - [x] Character-scene relationships
     - [x] Props listing
     - [x] Locations listing
   - [x] Create auth helpers:
     - [x] Move common auth checks to `convex/model/auth.ts`
     - [x] Implement `requireAuth` utility function
   - [x] Schema improvements for scene-specific notes:
     - [x] Remove notes field from characters, locations, and props tables
     - [x] Add notes field to all junction tables (character_scenes, location_scenes, prop_scenes)
     - [x] Update mutations to handle scene-specific notes
     - [x] Update queries to fetch scene-specific notes
   - [x] Optimize query patterns:
     - [x] Reduce sequential queries in script entities fetching
     - [x] Batch character-scene relationship queries
   - [x] Improve internal functions organization:
     - [x] Move scene analysis logic to internal actions
     - [x] Create dedicated internal functions for common operations
   - [x] Add size limits to `.collect()` operations:
     - [x] Add default limits where pagination isn't implemented
     - [x] Add warning comments for potentially large queries
   - [x] Error handling improvements:
     - [x] Standardize error messages
     - [x] Implement proper ConvexError usage


</details>


9. **Script Entities Screen** (4h)
   - [x] Script entities screen
   - [x] Script entities screen layout
   - [x] Tabs for Locations, Characters, Props
   - [x] finish crud
   - [ ] merge enntities actions
         - [ ] use serach query to get select options
         - [ ] ensure we propagate all changes (join tables) handling notes etc...
         - [ ] add a async select in each front end related part (pages and cards)
   - [x] dynamic button in save draft analysis stepper
   - [x] replace buttons in save analysis tabs + review form layout (name + quqntity in one line)

   **Files:** `src/app/[scriptId]/page.tsx`


### UI improvements

- [x] script upload with form to save name and description (and then upload)
- [ ] replace selected text with a editable text area (mardown editor?)
- [x] hunt missing trads in the app


## Error Handling (3h)
- [ ] Global error boundaries
- [ ] PDF loading error states
- [ ] AI failure fallbacks
**Files:** `src/providers/error.tsx`, `src/components/error-fallback.tsx`

## Completion Checklist
- [ ] End-to-env smoke test
- [ ] Basic mobile responsiveness
- [ ] Deployment verification
- [ ] Clear console logs
- [ ] i18n keys audit

## Analytics & Insights (Using Convex Aggregate Component)

1. **Setup & Infrastructure** (3h)
   - [ ] Install and configure @convex-dev/aggregate
   - [ ] Set up aggregation tables and indexes
   - [ ] Create base analytics utilities in `convex/analytics/`

2. **Portfolio-Level Analytics** (4h)
   - [ ] Script Volume Tracking
     - [ ] Implement script count over time using `TableAggregate`
     - [ ] Track total page count across all scripts
     - [ ] Monitor script upload frequency patterns
   - [ ] Entity Statistics
     - [ ] Aggregate character counts across scripts
     - [ ] Track location type distribution (INT/EXT ratio)
     - [ ] Monitor props usage patterns

3. **Writer's Analytics Dashboard** (5h)
   - [ ] Writing Patterns Analysis
     - [ ] Average scenes per script
     - [ ] Character density (characters per scene) trends
     - [ ] Location reuse patterns
   - [ ] Time-based Analysis
     - [ ] Script completion velocity
     - [ ] Most productive writing periods
     - [ ] Script complexity evolution over time

4. **Performance Optimization** (3h)
   - [ ] Implement proper namespacing for better throughput
   - [ ] Set up bounds for aggregated data
   - [ ] Configure lazy aggregation where appropriate
   - [ ] Add caching for frequently accessed metrics

5. **Analytics UI Components** (4h)
   - [ ] Create reusable chart components
   - [ ] Build analytics dashboard layout
   - [ ] Implement real-time updates for analytics
   - [ ] Add date range filters

Technical Notes:
- Use `namespace` for script-specific aggregations
- Implement proper bounds to optimize query performance
- Consider lazy aggregation for less frequently accessed metrics
- Ensure proper transaction handling for accurate counts

## Enhanced LLM Analysis (6h)

1. **Two-Pass LLM Architecture** (2h)
   - [ ] Split LLM interface into two methods: `analyzeScene` and `formatScene`
   - [ ] Enhance SceneAnalysis type to include contextual mentions
   - [ ] Create new types for formatted scene output
   - [ ] Update provider interface in `lib/llm/providers/index.ts`

2. **Tagger LLM Implementation** (2h)
   - [ ] Enhance first LLM prompt to extract contextual snippets
   - [ ] Update parsing logic to handle new response format
   - [ ] Add validation for contextual mentions
   - [ ] Add error handling for malformed context extractions

3. **Formatter LLM Implementation** (1h)
   - [ ] Create new prompt for text markup
   - [ ] Implement basic MD/HTML tagging system
   - [ ] Add validation for marked-up text output

4. **Preview Integration** (1h)
   - [ ] Add marked text preview to scene analysis UI
   - [ ] Style entity highlights in preview
   - [ ] Add toggle between raw/marked text views
   - [ ] Ensure mobile responsiveness for preview pane

Technical Notes:
- Keep character position tracking minimal due to raw text limitations
- Focus on reliable context extraction over precise positioning
- Consider using a simpler model for the formatting pass
- Add proper error boundaries for preview rendering

## Prompt Engineering & Entity Taxonomy (5h)

1. **Research & Standards Analysis** (2h)
   - [x] Compile industry sources for screenplay entity categorization
   - [x] Analyze major screenplay software categorization systems
   - [x] Review film production breakdown sheets standards
   - [x] Document findings in `docs/entity-standards.md`

2. **Entity Schema Enhancement** (1.5h)
   - [ ] Add new entity types:
     - [ ] Vehicles (with types: land, air, water, futuristic)
     - [ ] Animals (with categories: pets, wildlife, mythical)
     - [ ] Costumes/Wardrobe (with period, style attributes)
   - [x] Revise character types based on industry standards
   - [x] Update props categorization system
   - [ ] Enhance location type taxonomy

3. **Prompt Optimization** (1.5h)
   - [ ] Rewrite entity extraction prompts with new taxonomy
   - [ ] Add contextual awareness for entity relationships
   - [ ] Enhance prompt with examples from industry standards
   - [ ] Implement better validation rules for entity classification

Technical Notes:
- Consider using nested categorization for complex entities
- Add versioning to prompts for tracking effectiveness
- Plan for backward compatibility with existing analyses
- Consider adding confidence scores for entity classification

## Global Search Implementation (8h)

1. **Command Palette UI** (2.5h)
   - [x] Implement CMD+K listener and modal trigger
   - [x] Create SearchCommandPalette component with Cmdk
   - [x] Add keyboard navigation support
   - [ ] Style search results with entity-specific icons
   - [x] Add loading states and empty states
   - [x] Implement mobile-friendly interface

2. **Search Infrastructure** (2h)
   - [x] Create search index tables in Convex
   - [ ] Implement fuzzy search using n-gram tokenization
   - [ ] Add proper pagination for search results
   - [x] Set up debounced search with useStableQuery
   - [ ] Create search history tracking

3. **Entity-Specific Search** (2h)
   - [x] Implement search across all entity types:
     - [x] Scenes (by content, number, description)
     - [x] Characters (by name, type, scenes they appear in)
     - [x] Props (by name, type, associated scenes)
     - [x] Locations (by name, type, INT/EXT)
   - [ ] Add type-ahead suggestions
   - [ ] Create rich preview cards for each entity type

4. **Search UX Enhancements** (1.5h)
   - [ ] Add search filters (by entity type, date, status)
   - [ ] Implement recent searches
   - [ ] Add favorite searches functionality
   - [ ] Create keyboard shortcuts for common filters
   - [ ] Add search analytics tracking

Technical Notes:
- Use Cmdk for accessible command palette
- Implement proper cursor-based pagination
- Consider using aggregate tables for faster counting
- Add proper error boundaries for search failures
- Ensure proper debouncing for performance
