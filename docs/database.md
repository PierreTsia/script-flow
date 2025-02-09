# Database Documentation

## 1. Schema
*See backend.md for complete schema definitions*

## 2. Migrations & Schema Evolution

### Convex Approach
```typescript
// convex/migrations.ts
import { internalMutation } from './_generated/server'

// Example: Adding a 'status' field to all scripts
export const backfillScriptStatus = internalMutation({
  args: {},
  handler: async (ctx) => {
    const scripts = await ctx.db.query('scripts').collect()
    
    for (const script of scripts) {
      await ctx.db.patch(script._id, {
        status: 'ready' // default value
      })
    }
    
    console.log(`Updated ${scripts.length} scripts`)
  }
})
```

### Key Benefits
1. Run migrations from Convex Dashboard
2. TypeScript validation
3. No downtime needed
4. Automatic rollback if something fails

### Best Practices
1. Add new fields as optional
2. Run migrations during low traffic
3. Monitor migration progress in dashboard
4. Keep migration functions for documentation

## 3. Backup Strategy
```typescript
// Convex provides automatic backups but we should:
1. Configure retention period (30 days recommended)
2. Set up scheduled exports to our own storage
3. Document restore procedures
4. Test restore process regularly
```

## 4. Data Integrity
- Foreign key relationships enforced in code
- Cascade deletes handled by mutations
- Validation at API layer 