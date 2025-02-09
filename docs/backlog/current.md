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
   **Files:** `package.json`, `tsconfig.json`, `.eslintrc`, `.prettierrc`, `src/middleware.ts`

2. **Authentication** (4h)
   - [ ] Clerk basic integration
   - [ ] Protected routes (/scripts)
   - [ ] User state sync with Convex
   **Files:** `src/auth.ts`, `src/middleware.ts`, `src/app/layout.tsx`

3. **Database Setup** (3h)
   - [ ] Convex project initialization
   - [ ] Script/Scene schema definition
   - [ ] Basic CRUD operations
   **Files:** `convex/`, `.env`, `src/convex/`

4. **PDF Core** (6h)
   - [ ] PDF upload functionality
   - [ ] PDF.js viewer integration
   - [ ] Text selection capture
   **Files:** `src/components/pdf-viewer.tsx`, `src/hooks/use-pdf.ts`

5. **AI Integration** (5h)
   - [ ] LLM provider interface
   - [ ] Mistral API wrapper
   - [ ] Scene analysis service
   **Files:** `src/lib/llm-provider.ts`, `src/convex/ai.ts`

6. **Basic UI** (4h)
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
