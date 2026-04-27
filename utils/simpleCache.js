const DEFAULT_MAX_ENTRIES = 200;

export class SimpleCache {
  constructor({ maxEntries = DEFAULT_MAX_ENTRIES } = {}) {
    this.maxEntries = maxEntries;
    this.store = new Map(); // key -> { value, expiresAt }
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });

    // Basic eviction: drop oldest insertion when above max.
    while (this.store.size > this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
  }
}

export const sharedCache = new SimpleCache();

