# Detailed Analysis of Unused and Redundant Files

## UNUSED COMPONENTS WITH CODE EXAMPLES

### 1. ViewsChart.tsx (Component - UNUSED)
**File:** `/home/user/youtuber-analyzer-pro/src/components/ViewsChart.tsx`

**Code Snippet:**
```typescript
export const ViewsChart = ({ videos }: ViewsChartProps) => {
  const chartData = videos
    .sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime())
    .map((video) => ({
      date: video.uploadDate,
      views: video.views,
      title: video.title.length > 30 ? video.title.substring(0, 30) + "..." : video.title,
    }));
    
  // ... ComposedChart implementation
}
```

**Status:** NOT IMPORTED
- No grep results for "ViewsChart" imports
- Only definition found in the file itself

**Why Unused:** Likely replaced by ViewsTrend component or TopicChart component. The functionality appears redundant with other chart components in the app.

**Impact if Deleted:** None - no component uses this
**Size:** ~85 lines

---

### 2. SettingsModal.tsx (Component - UNUSED/DEPRECATED)
**File:** `/home/user/youtuber-analyzer-pro/src/components/settings/SettingsModal.tsx`

**Code Snippet:**
```typescript
interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: Tab;
}

export function SettingsModal({ open, onOpenChange, defaultTab = 'general' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const { t } = useI18n();
  
  // ... Tab switching logic
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        {/* ... tab content */}
      </DialogContent>
    </Dialog>
  );
}
```

**Status:** NOT IMPORTED - File defined but never imported
- Search for "SettingsModal" only shows the definition
- Never used in any page or component

**Why Unused:** Settings functionality is now handled by the `/settings` page route using Tabs component directly

**Alternative Implementation:**
The Settings page (/pages/Settings.tsx) renders the same components:
```typescript
export default function Settings() {
  // ... uses Tabs, TabsContent, TabsList, TabsTrigger directly
  // Renders: GeneralForm, ChannelForm, ApiForm, AccountPanel, UsagePanel
}
```

**Impact if Deleted:** None - Settings page handles all settings UI
**Size:** ~82 lines

---

## UNUSED UTILITY FILES WITH CODE EXAMPLES

### 3. apiGuard.ts (Utility - UNUSED)
**File:** `/home/user/youtuber-analyzer-pro/src/lib/apiGuard.ts`

**Code Snippet:**
```typescript
export interface ApiKeys {
  api_supabase_url: string | null;
  api_supabase_anon_key: string | null;
  api_youtube_key: string | null;
  api_youtube_analytics_key: string | null;
}

export async function checkRequiredApis(userId: string): Promise<{ 
  valid: boolean; 
  missing: string[] 
}> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('api_supabase_url, api_supabase_anon_key, api_youtube_key, api_youtube_analytics_key')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return {
      valid: false,
      missing: ['Youtube Data API', 'Youtube Analytics API', 'Supabase URL', 'Supabase Anon Key']
    };
  }

  const missing: string[] = [];
  // ... validation logic
  return { valid: missing.length === 0, missing };
}
```

**Status:** NOT IMPORTED
- Function is defined but never called anywhere
- No references to `checkRequiredApis` in the codebase

**Could Be Useful For:** API key validation before syncing videos. Could be integrated into AuthGateModal or sync process.

**Impact if Deleted:** Medium - Functionality could be needed for API validation
**Size:** ~47 lines

---

### 4. chartColors.ts (Utility - UNUSED)
**File:** `/home/user/youtuber-analyzer-pro/src/lib/chartColors.ts`

**Code Snippet:**
```typescript
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const getChartColor = (index: number): string => {
  const doc = document.documentElement;
  const vars = [
    "--chart-1", "--chart-2", "--chart-3", "--chart-4",
    "--chart-5", "--chart-6", "--chart-7", "--chart-8",
  ];
  const key = vars[index % vars.length];
  const val = getComputedStyle(doc).getPropertyValue(key).trim();
  return val || "#2563eb"; // fallback to blue
};
```

**Status:** NOT IMPORTED
- No references to CHART_COLORS or getChartColor anywhere
- Not used in any chart components

**Why Unused:** Color management is done via Tailwind CSS variables instead

**Impact if Deleted:** None - Colors are handled through Tailwind
**Size:** ~20 lines

---

## REDUNDANT/DUPLICATE FILES

### 5. use-toast.ts Duplication
**Two Versions Exist:**

**Version A (REAL IMPLEMENTATION):**
`/home/user/youtuber-analyzer-pro/src/hooks/use-toast.ts` (186 lines)
```typescript
import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// ... full implementation with reducer logic
```

**Version B (REDUNDANT RE-EXPORT):**
`/home/user/youtuber-analyzer-pro/src/components/ui/use-toast.ts` (3 lines)
```typescript
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
```

**Analysis:**
- Version A has complete implementation
- Version B is just a wrapper/re-export
- Current imports: Uses `@/hooks/use-toast` everywhere

**Recommendation:** DELETE Version B

---

### 6. Supabase Client Redundancy (3 Files)

**FILE 1 - REAL IMPLEMENTATION:**
`/home/user/youtuber-analyzer-pro/src/lib/supabaseClient.ts` (30+ lines)
```typescript
import { createClient } from '@supabase/supabase-js'

const url = 'https://ynhohgyttvriqlzwyqnw.supabase.co'
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const globalForSupabase = globalThis as unknown as {
  __yap_supabase?: ReturnType<typeof createClient>
}

export const supabase =
  globalForSupabase.__yap_supabase ??
  createClient(url, anon, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'yap-auth',
    },
  })

if (!globalForSupabase.__yap_supabase) {
  globalForSupabase.__yap_supabase = supabase
}

export function getSupabaseClient() {
  return supabase
}
```

**FILE 2 - RE-EXPORT (REDUNDANT):**
`/home/user/youtuber-analyzer-pro/src/lib/supabase.ts` (1 line)
```typescript
export { supabase } from './supabaseClient'
```

**FILE 3 - RE-EXPORT (REDUNDANT):**
`/home/user/youtuber-analyzer-pro/src/integrations/supabase/client.ts` (1 line)
```typescript
export { supabase } from '@/lib/supabaseClient'
```

**Current Usage:**
```
@/lib/supabase          - imported 12 times
@/lib/supabaseClient    - imported 2 times  
@/integrations/...      - imported 2 times
```

**Recommendation:** 
1. Delete `/src/lib/supabase.ts`
2. Delete `/src/integrations/supabase/client.ts`
3. Update 12 imports from `@/lib/supabase` to `@/lib/supabaseClient`

---

### 7. Empty Legacy File

**App.css (EMPTY - LEGACY)**
`/home/user/youtuber-analyzer-pro/src/App.css`

**Content:**
```css
/* Legacy styles removed - all styling now uses Tailwind + shadcn/ui tokens */

```

**Status:** 
- File exists but is empty (just a comment)
- Not imported anywhere
- Not referenced in any component

**Recommendation:** DELETE

---

## IMPORT CONSOLIDATION REQUIRED

### Current Problematic Imports:
```typescript
// THESE 12 IMPORTS SHOULD BE CHANGED:
import { supabase } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
// ... (12 total)

// CHANGE TO:
import { supabase } from '@/lib/supabaseClient';
```

### Files that Need Updates:
1. `/src/pages/AuthCallback.tsx`
2. `/src/pages/ResetPassword.tsx`
3. `/src/components/Sidebar.tsx`
4. `/src/lib/apiGuard.ts`
5. And 8 others

---

## UNUSED UI COMPONENTS (21+ Files)

All located in `/src/components/ui/` and NEVER IMPORTED:

| Component | File | Typical Use Case | Bundle Impact |
|-----------|------|-----------------|---|
| accordion | accordion.tsx | Collapsible sections | ~3KB |
| breadcrumb | breadcrumb.tsx | Navigation trail | ~2KB |
| calendar | calendar.tsx | Date selection | ~5KB |
| carousel | carousel.tsx | Image/content carousel | ~4KB |
| checkbox | checkbox.tsx | Multiple selection | ~2KB |
| collapsible | collapsible.tsx | Expandable sections | ~3KB |
| command | command.tsx | Command palette | ~6KB |
| context-menu | context-menu.tsx | Right-click menu | ~3KB |
| drawer | drawer.tsx | Slide-out panel | ~4KB |
| form | form.tsx | Form handling | ~3KB |
| input-otp | input-otp.tsx | OTP input | ~2KB |
| navigation-menu | navigation-menu.tsx | Multi-level nav | ~4KB |
| pagination | pagination.tsx | Page navigation | ~2KB |
| popover | popover.tsx | Floating menu | ~3KB |
| progress | progress.tsx | Progress bar | ~2KB |
| radio-group | radio-group.tsx | Single selection | ~2KB |
| resizable | resizable.tsx | Resizable panels | ~5KB |
| slider | slider.tsx | Range input | ~3KB |
| textarea | textarea.tsx | Multi-line input | ~1KB |
| toggle-group | toggle-group.tsx | Toggle buttons | ~2KB |

**Total Unused: ~65KB (estimated)**

