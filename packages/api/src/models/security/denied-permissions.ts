/**
 * Represents a map of denied paths.
 * - Each key is a path that is denied.
 * - The value is always `true`, indicating the path is denied.
 */
export type DeniedPermissions = Record<string, true>
