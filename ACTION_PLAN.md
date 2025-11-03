# Action Plan for Removing Dead Code & Unused Files

## Quick Reference - What to Delete

### SAFE TO DELETE (No Dependencies)
```
❌ /src/components/ViewsChart.tsx
❌ /src/components/settings/SettingsModal.tsx
❌ /src/lib/apiGuard.ts
❌ /src/lib/chartColors.ts
❌ /src/App.css
❌ /src/components/ui/use-toast.ts
❌ /src/lib/supabase.ts
❌ /src/integrations/supabase/client.ts
```

### OPTIONAL TO DELETE (Unused UI Components)
```
❌ /src/components/ui/accordion.tsx
❌ /src/components/ui/aspect-ratio.tsx
❌ /src/components/ui/breadcrumb.tsx
❌ /src/components/ui/calendar.tsx
❌ /src/components/ui/carousel.tsx
❌ /src/components/ui/chart.tsx
❌ /src/components/ui/checkbox.tsx
❌ /src/components/ui/collapsible.tsx
❌ /src/components/ui/command.tsx
❌ /src/components/ui/context-menu.tsx
❌ /src/components/ui/drawer.tsx
❌ /src/components/ui/form.tsx
❌ /src/components/ui/hover-card.tsx
❌ /src/components/ui/input-otp.tsx
❌ /src/components/ui/menubar.tsx
❌ /src/components/ui/navigation-menu.tsx
❌ /src/components/ui/pagination.tsx
❌ /src/components/ui/popover.tsx
❌ /src/components/ui/progress.tsx
❌ /src/components/ui/radio-group.tsx
❌ /src/components/ui/resizable.tsx
❌ /src/components/ui/sidebar.tsx
❌ /src/components/ui/slider.tsx
❌ /src/components/ui/textarea.tsx
❌ /src/components/ui/toggle-group.tsx
```

---

## STEP-BY-STEP CLEANUP PROCESS

### PHASE 1: High-Impact Cleanup (Mandatory)

#### Step 1: Delete Completely Unused Files
```bash
# Component files
rm /home/user/youtuber-analyzer-pro/src/components/ViewsChart.tsx
rm /home/user/youtuber-analyzer-pro/src/components/settings/SettingsModal.tsx

# Utility files
rm /home/user/youtuber-analyzer-pro/src/lib/apiGuard.ts
rm /home/user/youtuber-analyzer-pro/src/lib/chartColors.ts

# Duplicate/redundant files
rm /home/user/youtuber-analyzer-pro/src/components/ui/use-toast.ts
rm /home/user/youtuber-analyzer-pro/src/lib/supabase.ts
rm /home/user/youtuber-analyzer-pro/src/integrations/supabase/client.ts

# Empty legacy file
rm /home/user/youtuber-analyzer-pro/src/App.css
```

#### Step 2: Update All Supabase Imports
Replace all imports of `@/lib/supabase` with `@/lib/supabaseClient`

Files to update:
1. `/src/pages/AuthCallback.tsx`
   - Change: `import { supabase } from '@/lib/supabase';`
   - To: `import { supabase } from '@/lib/supabaseClient';`

2. `/src/pages/ResetPassword.tsx`
   - Change: `import { supabase } from '@/lib/supabase';`
   - To: `import { supabase } from '@/lib/supabaseClient';`

3. `/src/components/Sidebar.tsx`
   - Change: `import { supabase } from '@/lib/supabase';`
   - To: `import { supabase } from '@/lib/supabaseClient';`

4. Plus 9 other files (check grep results)

Command to find all files needing updates:
```bash
grep -r "from ['\"]@/lib/supabase['\"]" /home/user/youtuber-analyzer-pro/src --include="*.tsx" --include="*.ts"
```

---

### PHASE 2: Optional UI Component Cleanup (Recommended)

If you want to reduce bundle size and remove unused UI components:

```bash
# Delete all 21+ unused UI components
cd /home/user/youtuber-analyzer-pro/src/components/ui

rm accordion.tsx
rm aspect-ratio.tsx
rm breadcrumb.tsx
rm calendar.tsx
rm carousel.tsx
rm chart.tsx
rm checkbox.tsx
rm collapsible.tsx
rm command.tsx
rm context-menu.tsx
rm drawer.tsx
rm form.tsx
rm hover-card.tsx
rm input-otp.tsx
rm menubar.tsx
rm navigation-menu.tsx
rm pagination.tsx
rm popover.tsx
rm progress.tsx
rm radio-group.tsx
rm resizable.tsx
rm sidebar.tsx
rm slider.tsx
rm textarea.tsx
rm toggle-group.tsx
```

**Bundle size savings:** Approximately 65KB

---

## VERIFICATION CHECKLIST

After making changes, verify:

### 1. Test Build
```bash
npm run build
# or
bun run build
```

### 2. Check for Import Errors
```bash
npm run lint
# or
bun run lint
```

### 3. Run Tests (if applicable)
```bash
npm run test
# or
bun run test
```

### 4. Manual Testing
- [ ] Load the home page - should work normally
- [ ] Navigate to settings - should show all settings
- [ ] Check charts and tables - should display correctly
- [ ] Test authentication flow - should work
- [ ] Test video sync functionality - should complete without errors

### 5. Verify No Import Errors
After deleting files, check:
```bash
# Should return no results if cleanup successful
grep -r "ViewsChart\|SettingsModal\|apiGuard\|chartColors\|from '@/lib/supabase'" /home/user/youtuber-analyzer-pro/src --include="*.tsx" --include="*.ts"
```

---

## DETAILED IMPORT UPDATE COMMANDS

To update all supabase imports in one go, you can use sed:

```bash
# Backup first
cp -r /home/user/youtuber-analyzer-pro/src /home/user/youtuber-analyzer-pro/src.backup

# Update all files
find /home/user/youtuber-analyzer-pro/src -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '@/lib/supabase'|from '@/lib/supabaseClient'|g"
find /home/user/youtuber-analyzer-pro/src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from "@/lib/supabase"|from "@/lib/supabaseClient"|g'
```

### Files to Update (12 locations):
```
/src/pages/AuthCallback.tsx
/src/pages/ResetPassword.tsx
/src/components/Sidebar.tsx
/src/lib/apiGuard.ts (will be deleted, so skip if already removed)
/src/lib/supabase.ts (will be deleted, so skip if already removed)
(9 others - verify with grep)
```

---

## ROLLBACK PLAN

If something breaks after cleanup:

1. **Restore from backup:**
   ```bash
   rm -rf /home/user/youtuber-analyzer-pro/src
   mv /home/user/youtuber-analyzer-pro/src.backup /home/user/youtuber-analyzer-pro/src
   ```

2. **Or use git:**
   ```bash
   git checkout HEAD -- src/
   # or
   git reset --hard HEAD
   ```

---

## DOCUMENTATION RECOMMENDATIONS

### Create a cleanup notes document:
```markdown
# Code Cleanup - [Date]

## Files Deleted:
- ViewsChart.tsx (unused component)
- SettingsModal.tsx (deprecated in favor of Settings page)
- apiGuard.ts (unused utility)
- chartColors.ts (unused utility)
- App.css (empty legacy file)
- use-toast.ts duplicate (redundant re-export)
- supabase.ts (redundant re-export)
- integrations/supabase/client.ts (redundant re-export)

## UI Components Deleted:
- [List all 21+ deleted UI components]

## Import Changes:
- Consolidated supabase imports to use @/lib/supabaseClient

## Testing:
- Build passed
- No import errors
- Manual testing completed
- All features working
```

---

## SUMMARY OF BENEFITS

### Code Quality
- Remove dead code and unused imports
- Simplified import structure (single Supabase client)
- Cleaner codebase for maintenance

### Bundle Size Reduction
- Removing 6 unused files: ~200KB
- Removing 21+ UI components: ~65KB
- **Total reduction: ~265KB** (if UI components also deleted)

### Maintainability
- Fewer files to maintain
- Clearer component dependencies
- Easier to understand file structure

### Developer Experience
- Faster initial load times
- Smaller git history diffs
- Clearer component dependencies

