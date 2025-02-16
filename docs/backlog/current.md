# Core Development Journey

## Phase Order (MVP Critical Path)

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
   - [ ] Add pagination to large result sets:
     - [ ] Scenes listing
     - [ ] Characters listing
     - [ ] Character-scene relationships
   - [ ] Create auth helpers:
     - [ ] Move common auth checks to `convex/model/auth.ts`
     - [ ] Implement `requireAuth` utility function
   - [ ] Schema improvements for scene-specific notes:
     - [ ] Remove notes field from characters, locations, and props tables
     - [ ] Add notes field to all junction tables (character_scenes, location_scenes, prop_scenes)
     - [ ] Update mutations to handle scene-specific notes
     - [ ] Update queries to fetch scene-specific notes
     - [ ] Update AI response handling to store notes in junction tables
   - [ ] Optimize query patterns:
     - [ ] Reduce sequential queries in script entities fetching
     - [ ] Batch character-scene relationship queries
   - [ ] Improve internal functions organization:
     - [ ] Move scene analysis logic to internal actions
     - [ ] Create dedicated internal functions for common operations
   - [ ] Add size limits to `.collect()` operations:
     - [ ] Add default limits where pagination isn't implemented
     - [ ] Add warning comments for potentially large queries
   - [ ] Error handling improvements:
     - [ ] Standardize error messages
     - [ ] Implement proper ConvexError usage

8. **Basic UI** (4h)
   - [x] Upload button
   - [x] Script view layout
   - [x] Analysis modal
   **Files:** `src/app/page.tsx`, `src/components/upload.tsx`

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
