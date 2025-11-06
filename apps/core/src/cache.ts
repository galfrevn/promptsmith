import type { PromptFormat } from "./types";

/**
 * Cache entry for built prompts
 */
type CacheEntry = {
  markdown?: string;
  toon?: string;
  compact?: string;
};

/**
 * Manages caching of built prompts to improve performance.
 *
 * The cache stores built prompts for each format (markdown, toon, compact)
 * and invalidates when the builder state changes.
 */
export class PromptCache {
  private _cache: CacheEntry = {};
  private _isDirty = true;

  /**
   * Marks the cache as dirty, requiring a rebuild on next access.
   */
  invalidate(): void {
    this._isDirty = true;
    this._cache = {};
  }

  /**
   * Checks if the cache is dirty (needs rebuild).
   */
  isDirty(): boolean {
    return this._isDirty;
  }

  /**
   * Gets a cached prompt for the specified format.
   *
   * @param format - The prompt format
   * @returns The cached prompt or undefined if not cached
   */
  get(format: PromptFormat): string | undefined {
    if (this._isDirty) {
      return;
    }
    return this._cache[format];
  }

  /**
   * Sets a cached prompt for the specified format.
   *
   * @param format - The prompt format
   * @param prompt - The built prompt string
   */
  set(format: PromptFormat, prompt: string): void {
    this._cache[format] = prompt;
    this._isDirty = false;
  }

  /**
   * Clears all cached prompts.
   */
  clear(): void {
    this._cache = {};
    this._isDirty = true;
  }

  /**
   * Gets cache statistics.
   */
  getStats(): {
    isDirty: boolean;
    cachedFormats: PromptFormat[];
    cacheSize: number;
  } {
    const cachedFormats = Object.keys(this._cache) as PromptFormat[];
    const cacheSize = cachedFormats.reduce(
      (sum, format) => sum + (this._cache[format]?.length || 0),
      0
    );

    return {
      isDirty: this._isDirty,
      cachedFormats,
      cacheSize,
    };
  }
}
