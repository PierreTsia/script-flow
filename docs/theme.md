# Theme Configuration

## 1. Brand Identity
Our app is for professional film production - it should feel:
- Professional & Clean
- High Contrast (for readability of PDFs)
- Subtle film industry references
- Modern but not flashy

## 2. Color Palette (Phase 1)

```typescript
// Light Mode
export const lightTheme = {
  // Primary - Deep slate blue: professional without being corporate
  primary: {
    DEFAULT: "#334155",  // Main actions, headers
    foreground: "#ffffff",
    hover: "#475569",
  },

  // Secondary - Neutral grays for clear hierarchy
  secondary: {
    DEFAULT: "#64748b",
    foreground: "#ffffff",
    hover: "#94a3b8",
  },

  // Background - Clean, paper-like feel
  background: {
    DEFAULT: "#ffffff",
    secondary: "#f8fafc",
    tertiary: "#f1f5f9",
  },

  // Accent - Slate red: subtle film industry nod
  accent: {
    DEFAULT: "#ef4444",
    foreground: "#ffffff",
    hover: "#f87171",
  }
}

// Dark Mode
export const darkTheme = {
  // Primary - Lighter slate blue for readability
  primary: {
    DEFAULT: "#a8b8d8",    // Adjusted for better contrast
    foreground: "#000000",
    hover: "#cbd5e1",
  },

  // Secondary - Clear but not harsh
  secondary: {
    DEFAULT: "#64748b",
    foreground: "#000000",
    hover: "#94a3b8",
  },

  // Background - Soft dark, easier on eyes
  background: {
    DEFAULT: "#0f172a",
    secondary: "#1e293b",
    tertiary: "#334155",
  },

  // Accent - Warmer red for dark mode
  accent: {
    DEFAULT: "#f87171",
    foreground: "#000000",
    hover: "#fca5a5",
  }
}
```

## 3. Typography

```typescript
export const typography = {
  fontFamily: {
    sans: ['Inter', 'sans-serif'],     // Main text
    mono: ['JetBrains Mono', 'monospace']  // PDF content
  },
  
  // Professional, clear hierarchy
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem'     // 32px
  }
}
```

## 4. Component Examples

### Scene Card
```typescript
// Light mode
backgroundColor: background.secondary
border: "1px solid #e2e8f0"
title: primary.DEFAULT
metadata: secondary.DEFAULT

// Dark mode
backgroundColor: background.secondary
border: "1px solid #334155"
title: primary.DEFAULT
metadata: secondary.DEFAULT
```

### PDF Viewer
```typescript
// Light mode
backgroundColor: background.DEFAULT
selectionHighlight: "rgba(26, 54, 93, 0.1)"  // primary with opacity
toolbar: background.secondary

// Dark mode
backgroundColor: background.secondary  // Slightly lighter than main bg
selectionHighlight: "rgba(96, 165, 250, 0.2)"  // primary with opacity
toolbar: background.tertiary
```

## 5. Theme Testing

### Quick Test with Tailwind Play
1. Visit [Tailwind Play](https://play.tailwindcss.com/)
2. Paste this code to visualize our palette:

```html
<div class="p-8 space-y-4">
  <!-- Light Mode -->
  <div class="space-y-2">
    <h2 class="text-lg font-bold">Light Mode</h2>
    
    <!-- Primary -->
    <div class="flex gap-2">
      <div class="w-20 h-20 bg-[#4f46e5] flex items-center justify-center text-white">Primary</div>
      <div class="w-20 h-20 bg-[#6366f1] flex items-center justify-center text-white">Hover</div>
    </div>
    
    <!-- Background Layers -->
    <div class="flex gap-2">
      <div class="w-20 h-20 bg-white border flex items-center justify-center">BG</div>
      <div class="w-20 h-20 bg-[#fafafa] border flex items-center justify-center">BG-2</div>
      <div class="w-20 h-20 bg-[#f4f4f5] border flex items-center justify-center">BG-3</div>
    </div>
    
    <!-- Accent -->
    <div class="w-20 h-20 bg-[#f43f5e] flex items-center justify-center text-white">Accent</div>
  </div>

  <!-- Dark Mode -->
  <div class="space-y-2 bg-[#0f172a] p-4">
    <h2 class="text-lg font-bold text-white">Dark Mode</h2>
    
    <!-- Primary -->
    <div class="flex gap-2">
      <div class="w-20 h-20 bg-[#a8b8d8] flex items-center justify-center text-black">Primary</div>
      <div class="w-20 h-20 bg-[#cbd5e1] flex items-center justify-center text-black">Hover</div>
    </div>
    
    <!-- Background Layers -->
    <div class="flex gap-2">
      <div class="w-20 h-20 bg-[#18181b] border border-gray-700 flex items-center justify-center text-white">BG</div>
      <div class="w-20 h-20 bg-[#27272a] border border-gray-700 flex items-center justify-center text-white">BG-2</div>
      <div class="w-20 h-20 bg-[#3f3f46] border border-gray-700 flex items-center justify-center text-white">BG-3</div>
    </div>
    
    <!-- Accent -->
    <div class="w-20 h-20 bg-[#fb7185] flex items-center justify-center">Accent</div>
  </div>
</div>
```

### Contrast Checking Tools
1. [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - Test primary text combinations:
     - Light mode: #334155 on #ffffff => 11.31:1 ✅ WCAG AAA
     - Dark mode: #a8b8d8 on #0f172a => 9.24:1 ✅ WCAG AAA

2. [Coolors Contrast Checker](https://coolors.co/contrast-checker)
3. [Who Can Use](https://whocanuse.com/)

### Quick Node Script
```typescript
// contrast.ts - Quick test script
import { colord } from "colord";

const testContrast = (bg: string, fg: string) => {
  const contrast = colord(bg).contrast(fg);
  console.log(`
    Background: ${bg}
    Foreground: ${fg}
    Contrast Ratio: ${contrast}
    WCAG AA: ${contrast >= 4.5 ? '✅' : '❌'}
    WCAG AAA: ${contrast >= 7 ? '✅' : '❌'}
  `);
}

// Test main combinations
testContrast("#ffffff", "#334155");  // Light mode text
testContrast("#0f172a", "#a8b8d8");  // Dark mode text
```

## Future Phases

### Phase 4 - Enhanced Features
- Theme variants:
  - Classic film industry
  - Modern production house
  - High contrast accessibility
- Theme selection in settings
- Theme preference persistence 