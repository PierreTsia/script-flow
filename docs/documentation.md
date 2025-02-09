# Code Documentation Strategy

## Core Principle
**"Types and Tests Are Truth"**  
Let TypeScript interfaces and test cases serve as primary documentation.

## Essential Documents
| File              | Purpose                          | Example Content               |
|-------------------|----------------------------------|-------------------------------|
| [`backend.md`](./backend.md)     | Database schema + Core logic     | `Script` interface            |
| [`api.md`](./api.md)         | Endpoint specs + Examples       | `POST /api/scripts` flow       |
| [`testing.md`](./testing.md)     | Test patterns + Coverage        | Upload flow test cases         |
| [`devops.md`](./devops.md)      | Infrastructure + Deployment     | Local vs prod Convex setup     |

## Update Triggers
1. **Database Schema Change** → Update `backend.md#database-schema`
2. **New API Endpoint** → Add to `api.md` + Link from relevant code
3. **New Test Pattern** → Extend `testing.md` with example
4. **Infra Change** → Record in `devops.md` with rationale

## Cross-Doc Links
```markdown
# In backend.md
[Related API Endpoints](../api.md#script-operations)

# In api.md 
[Underlying Database Schema](../backend.md#database-schema)

# In testing.md
[Tested Production Deployment](../devops.md#prod-deploy)
```

## Maintenance Workflow
**Adding Scene Analysis:**
1. Code `analyzeScene` with typed inputs/outputs
2. Add to `backend.md#ai-integration` section
3. Document API endpoint in `api.md#scene-analysis`
4. Write test in `testing.md#ai-analysis` 
5. Commit: "feat: scene analysis - docs updated"

**No New Files** - Keep evolving these 4 core documents. 