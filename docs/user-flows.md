# User Flows (MVP)

## 1. Authentication
```mermaid
graph TD
    A[Landing Page] -->|"Get Started"| B{Logged In?}
    B -->|No| C[Clerk Modal]
    B -->|Yes| D[/Dashboard/]
    C -->|Google/Email| D
    C -->|"Continue as Guest (Phase 2)"| E[Local Storage Session]
```

**Features:**
- Clerk pre-built modal
- Google + Email magic links
- Guest session persists until browser close
- No password management
- No email verification

---

## 2. Core Journey
```mermaid
graph TD
    A[/Dashboard/] -->|Upload PDF| B{<50MB?}
    B -->|Yes| C[/Script View/]
    B -->|No| A
    C -->|Select Text| D{>5 words?}
    D -->|Yes| E[Show Analyze Button]
    D -->|No| C
    E -->|Click| F[AI Processing]
    F -->|Success| G[/Scene Breakdown/]
    F -->|Fail| H[Retry]
    H --> C
```

**Error Handling:**
- PDF Upload: 
  - Toast: "Only PDFs under 50MB"
- AI Failures:
  - Toast: "Analysis failed. Try selecting different text"
  
---

## 3. Scene Breakdown
```mermaid
graph TD
    A[/Scene Breakdown/] --> B[Edit Auto-Detected Items]
    B --> C{Valid?}
    C -->|Yes| D[Save to Profile]
    C -->|No| B
    D --> E[/Export PDF/]
```

**Features:**
- Basic form validation (required fields)
- Export as PDF button
- No version history
- No collaboration

---

## Edge Cases Handled
1. **PDF Uploads**
   - Non-PDF files → Reject
   - >50MB → Error toast
2. **Text Selection**
   - Empty selections → Disable analyze
   - Cross-scene selections → Auto-split
3. **AI Failures**
   - Timeout → "Took too long. Try again"
   - Invalid JSON → "Technical error. Contact support"

---

## Permissions
| User Type  | Capabilities                 |
|------------|------------------------------|
| Guest      | 1 script, no saving          |
| Logged In  | 3 scripts, save to profile   |
---

