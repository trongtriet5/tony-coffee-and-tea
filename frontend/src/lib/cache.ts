export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const TTL = 60000;

class CacheService {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    if (!(global as any).apiCache) {
      (global as any).apiCache = new Map<string, CacheEntry<any>>();
    }
    this.cache = (global as any).apiCache;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheService = new CacheService();
export default cacheService;
