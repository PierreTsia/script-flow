## API Communication

### 1. Core Endpoints (Phase 1)

#### Upload Script
```typescript
// Request
POST /api/scripts
Content-Type: multipart/form-data

Body:
- file: PDF file (binary)
- name: string

// Response 201
{
  "id": "script_123",
  "name": "My Screenplay",
  "status": "processing",
  "pageCount": 90
}
```

#### Analyze Scene
```typescript
// Request
POST /api/scenes/analyze
Content-Type: application/json

{
  "text": "INT. COFFEE SHOP - DAY\nJohn enters, looks around...",
  "scriptId": "script_123"
}

// Response 200 (Matches DB schema + confidence)
{
  "characters": [
    {
      "mentionedAs": "John",
      "confidence": 0.92,
      "existingId": "char_456" // If match found
    }
  ],
  "props": [
    {
      "mentionedAs": "coffee cup",
      "confidence": 0.87
    }
  ],
  "location": {
    "mentionedAs": "COFFEE SHOP",
    "confidence": 0.95,
    "existingId": "loc_789"
  }
}
```

### 2. Error Handling (Basic)
```typescript
// Standard Error Format
{
  "error": {
    "code": "invalid_pdf",
    "message": "Unsupported PDF version"
  }
}

// Common Codes:
- invalid_pdf
- text_selection_too_small
- ai_processing_timeout
```

### 3. Real-Time Updates
```typescript
// Using SSE for script processing status
GET /api/scripts/{id}/events

// Example event:
data: {
  "status": "processing",
  "progress": 75,
  "scenesProcessed": 42
}
```

### 4. Payload Guidelines
1. Use `snake_case` for all JSON fields
2. Include `scriptId` in all scene-related requests
3. Return minimal viable responses
4. Match DB schema structure where possible

### 5. Implementation Details

The API routes structure and backend implementation can be found in the [Backend Documentation](./backend.md#7-api-routes-structure). Key implementation notes:

1. All endpoints route through Next.js API before reaching Convex
2. Real-time updates powered by Convex's data synchronization
3. Error codes map to specific backend validation checks

### Future Considerations
- Rate limiting (Phase 2)
- Detailed error codes (Phase 2)
- Request validation middleware
- API versioning 