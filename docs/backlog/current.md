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
   - [ ] Script/Scene schema definition
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
   - [ ] create new hook 'useScene' and convex file `scenes.ts` with analyse function
   - [ ] this analyse function should take the selected text and the page number 
   - [ ] and then call the LLM using an http convex request (see https://docs.convex.dev/functions/http-actions)
   - [ ] the call is done through the LLM provider interface => see @ai-providers.md
   - [ ] Mistral API wrapper
   **Files:** `/hooks/useScene.ts`, `src/convex/scenes.ts`

7. **Basic UI** (4h)
   - [ ] Upload button
   - [ ] Script view layout
   - [ ] Analysis modal
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
