/**
 * Stencil global script, executed once before any component bundle loads.
 *
 * Reactodia's transitive dependencies (n3 / readable-stream) reference the Node.js
 * `process` global at module-evaluation time (e.g. `util.debuglog` reads
 * `process.env.NODE_DEBUG`). That global does not exist in the browser, so we provide
 * a minimal shim here to keep those modules from crashing when the
 * <onto-reactodia-graph> component bundle is loaded.
 */
export default function appGlobalScript(): void {
  const globalScope = globalThis as unknown as {process?: {env?: Record<string, string | undefined>}};
  if (!globalScope.process) {
    globalScope.process = {env: {NODE_ENV: 'production'}};
  } else if (!globalScope.process.env) {
    globalScope.process.env = {NODE_ENV: 'production'};
  }
}
