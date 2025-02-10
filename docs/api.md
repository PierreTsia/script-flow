## API Communication (Convex Direct)

### 1. Core Operations (Phase 1)

#### Upload Script
```typescript
// Convex Mutation: scripts.upload
const uploadScript = useMutation(api.scripts.upload);

// Usage
const handleUpload = async (file: File) => {
  const scriptId = await uploadScript({
    name: file.name,
    file: await storeFile(file) // Using Convex file storage
  });
}
```

#### Analyze Scene
```typescript
// Convex Action: scenes.analyze
const analyzeScene = useAction(api.scenes.analyze);

// Usage
const analysis = await analyzeScene({
  text: selectedText,
  scriptId: currentScriptId
});

// Response matches existing schema
```

### 2. Error Handling
```typescript
// Convex Error Format (try/catch example)
try {
  await createScene({ ... });
} catch (error) {
  console.error({
    code: error.data?.code, // Custom error codes
    message: error.message
  });
}

// Common Codes:
- insufficient_permissions
- invalid_entity_reference
- ai_processing_timeout
```

### 3. Real-Time Updates
```typescript
// Using Convex React hook
const scriptStatus = useQuery(api.scripts.getStatus, { scriptId });

// Real-time status object:
{
  status: "processing",
  progress: 75,
  scenesProcessed: 42
}
```

### 4. Data Guidelines
1. Use `camelCase` for all JSON fields
2. Include `scriptId` in all scene-related operations
3. Return Convex document structures directly
4. Use Convex IDs (`Id<"scripts">`) for references

### 5. Implementation Notes

Key architecture changes from previous version:
1. **No API middleware** - Frontend uses Convex directly via auto-generated hooks
2. **Type-safe operations** - All mutations/queries have validated args
3. **Automatic real-time** - Data sync handled by Convex reactivity
4. **Security internalized** - Auth checks happen within Convex functions

### Future Considerations
- Optimistic UI updates using Convex mutations
- Pagination patterns for large scripts
- Batch operations for entity management 