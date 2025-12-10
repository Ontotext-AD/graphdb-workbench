export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function toObject<T extends object>(value: unknown): Partial<T> {
  return isNonNullObject(value) ? (value as T) : {};
}

// Strict: validates presence of required keys, returns full T or throws.
export function toObjectStrict<T extends object>(value: unknown, requiredKeys: (keyof T)[]): T {
  if (!isNonNullObject(value)) {
    throw new Error('Expected object');
  }

  for (const k of requiredKeys) {
    if (value[k as string] === undefined) {
      throw new Error(`Missing required key: ${String(k)}`);
    }
  }

  return value as T;
}

// narrow Partial<T> to T after key checks.
export function assertComplete<T extends object>(src: Partial<T>, requiredKeys: (keyof T)[]): T {
  for (const k of requiredKeys) {
    if (src[k] === undefined) {
      throw new Error(`Incomplete object; missing ${String(k)}`);
    }
  }
  return src as T;
}

export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
