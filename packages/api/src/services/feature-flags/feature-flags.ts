declare global {
  interface Window {
    __FEATURE_FLAGS__?: Record<string, boolean>;
  }
}

const flags: Record<string, boolean> = window.__FEATURE_FLAGS__ ?? {};

export function isFeatureEnabled(flag: string): boolean {
  return flags[flag];
}
