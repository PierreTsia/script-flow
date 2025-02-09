# State Management Documentation

## 1. Core Principles
- Next.js API Routes as Backend-for-Frontend
- Server Components for data fetching
- Client Components for interactivity
- Local state when possible
- Real-time updates via SSE (Phase 2)

## 2. State Categories

### Server State
```typescript
// hooks/use-script.ts
export function useScript(id: string) {
  const [script, setScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchScript = async () => {
      const response = await fetch(`/api/scripts/${id}`)
      const data = await response.json()
      setScript(data)
      setLoading(false)
    }
    
    // Real-time updates
    const events = new EventSource(`/api/scripts/${id}/events`)
    events.onmessage = (event) => {
      setScript(JSON.parse(event.data))
    }
    
    fetchScript()
    return () => events.close()
  }, [id])
  
  return { script, loading }
}
```

### UI State
```typescript
// Local component state for UI interactions
export function PDFViewer() {
  const [scale, setScale] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [selection, setSelection] = useState<PDFSelection | null>(null)
  
  // PDF viewer specific state stays in the component
  return (
    <div>
      <PDFControls scale={scale} onScaleChange={setScale} />
      <PageNavigation 
        current={currentPage} 
        onChange={setCurrentPage} 
      />
    </div>
  )
}
```

### Form State
```typescript
// Using react-hook-form for form management
export function SceneForm() {
  const form = useForm<SceneFormData>({
    resolver: zodResolver(sceneSchema),
    defaultValues: {
      // Initial values
    }
  })

  const onSubmit = async (data: SceneFormData) => {
    await fetch('/api/scenes', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>
}
```

### Persistent State
```typescript
// Simple localStorage wrapper for user preferences
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue] as const
}

// Usage
export function PDFSettings() {
  const [scale, setScale] = useLocalStorage('pdf-scale', 1)
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  // ...
}
```
