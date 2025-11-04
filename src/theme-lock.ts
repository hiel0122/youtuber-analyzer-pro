export function assertDesignTokens() {
  const required = ['--primary','--secondary','--accent','--warning','--destructive','--background','--card','--border','--ring','--chart-1','--chart-8'];
  const cs = getComputedStyle(document.documentElement);
  const missing = required.filter(k => !cs.getPropertyValue(k));
  if (missing.length) {
    console.warn('[TokenGuard] Missing tokens:', missing);
  } else {
    console.log('[TokenGuard] All design tokens loaded ✓');
  }
}
