interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export class MemoryCache {
  private static instance: MemoryCache | null = null;
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  private constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes default

  static getInstance(defaultTTL?: number): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache(defaultTTL || 5 * 60 * 1000);
    }
    return MemoryCache.instance;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    
    this.cache.set(key, entry);
    this.stats.sets++;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
        this.stats.evictions++;
      }
    }
    
    return cleaned;
  }
}