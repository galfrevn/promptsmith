import { describe, expect, test } from "bun:test";
import { PromptCache } from "../src/cache";

describe("PromptCache", () => {
  describe("Constructor", () => {
    test("creates new cache with dirty state", () => {
      const cache = new PromptCache();
      expect(cache.isDirty()).toBe(true);
    });
  });

  describe("invalidate()", () => {
    test("marks cache as dirty", () => {
      const cache = new PromptCache();
      cache.set("markdown", "test prompt");
      expect(cache.isDirty()).toBe(false);

      cache.invalidate();
      expect(cache.isDirty()).toBe(true);
    });

    test("clears all cached prompts", () => {
      const cache = new PromptCache();
      cache.set("markdown", "markdown prompt");
      cache.set("toon", "toon prompt");
      cache.set("compact", "compact prompt");

      cache.invalidate();

      expect(cache.get("markdown")).toBeUndefined();
      expect(cache.get("toon")).toBeUndefined();
      expect(cache.get("compact")).toBeUndefined();
    });
  });

  describe("set() and get()", () => {
    test("stores and retrieves markdown format", () => {
      const cache = new PromptCache();
      cache.set("markdown", "# Test\nContent");

      expect(cache.get("markdown")).toBe("# Test\nContent");
    });

    test("stores and retrieves toon format", () => {
      const cache = new PromptCache();
      cache.set("toon", "Identity: Test");

      expect(cache.get("toon")).toBe("Identity: Test");
    });

    test("stores and retrieves compact format", () => {
      const cache = new PromptCache();
      cache.set("compact", "Test compact");

      expect(cache.get("compact")).toBe("Test compact");
    });

    test("marks cache as clean after set", () => {
      const cache = new PromptCache();
      expect(cache.isDirty()).toBe(true);

      cache.set("markdown", "test");
      expect(cache.isDirty()).toBe(false);
    });

    test("returns undefined for dirty cache", () => {
      const cache = new PromptCache();
      cache.set("markdown", "test");
      cache.invalidate();

      expect(cache.get("markdown")).toBeUndefined();
    });

    test("returns undefined for uncached format", () => {
      const cache = new PromptCache();
      cache.set("markdown", "test");

      expect(cache.get("toon")).toBeUndefined();
    });

    test("allows overwriting existing format", () => {
      const cache = new PromptCache();
      cache.set("markdown", "first");
      cache.set("markdown", "second");

      expect(cache.get("markdown")).toBe("second");
    });
  });

  describe("clear()", () => {
    test("clears all cached prompts", () => {
      const cache = new PromptCache();
      cache.set("markdown", "md");
      cache.set("toon", "tn");
      cache.set("compact", "cp");

      cache.clear();

      expect(cache.get("markdown")).toBeUndefined();
      expect(cache.get("toon")).toBeUndefined();
      expect(cache.get("compact")).toBeUndefined();
    });

    test("marks cache as dirty", () => {
      const cache = new PromptCache();
      cache.set("markdown", "test");
      expect(cache.isDirty()).toBe(false);

      cache.clear();
      expect(cache.isDirty()).toBe(true);
    });
  });

  describe("getStats()", () => {
    test("returns stats with dirty state", () => {
      const cache = new PromptCache();
      const stats = cache.getStats();

      expect(stats.isDirty).toBe(true);
      expect(stats.cachedFormats).toEqual([]);
      expect(stats.cacheSize).toBe(0);
    });

    test("returns stats with cached formats", () => {
      const cache = new PromptCache();
      cache.set("markdown", "# Test");
      cache.set("toon", "Identity: Test");

      const stats = cache.getStats();

      expect(stats.isDirty).toBe(false);
      expect(stats.cachedFormats).toContain("markdown");
      expect(stats.cachedFormats).toContain("toon");
      expect(stats.cachedFormats.length).toBe(2);
      // cacheSize is total character length: "# Test" (6) + "Identity: Test" (14) = 20
      // biome-ignore lint/style/noMagicNumbers: Test value for cache size calculation
      expect(stats.cacheSize).toBe(20);
    });

    test("returns all three formats when all cached", () => {
      const cache = new PromptCache();
      cache.set("markdown", "md");
      cache.set("toon", "tn");
      cache.set("compact", "cp");

      const stats = cache.getStats();

      expect(stats.cachedFormats).toEqual(
        expect.arrayContaining(["markdown", "toon", "compact"])
      );
      // cacheSize is total character length: "md" (2) + "tn" (2) + "cp" (2) = 6
      // biome-ignore lint/style/noMagicNumbers: Test value for cache size calculation
      expect(stats.cacheSize).toBe(6);
    });

    test("updates stats after invalidation", () => {
      const cache = new PromptCache();
      cache.set("markdown", "test");
      cache.invalidate();

      const stats = cache.getStats();

      expect(stats.isDirty).toBe(true);
      expect(stats.cachedFormats).toEqual([]);
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe("Edge cases", () => {
    test("handles empty string as value", () => {
      const cache = new PromptCache();
      cache.set("markdown", "");

      expect(cache.get("markdown")).toBe("");
    });

    test("handles very large prompt", () => {
      const cache = new PromptCache();
      // biome-ignore lint/style/noMagicNumbers: Testing large prompt handling
      const largePrompt = "x".repeat(100_000);
      cache.set("markdown", largePrompt);

      expect(cache.get("markdown")).toBe(largePrompt);
    });

    test("handles special characters in prompt", () => {
      const cache = new PromptCache();
      const specialPrompt = "Test\n\t\"quotes\"\n'single'\n\\backslash";
      cache.set("markdown", specialPrompt);

      expect(cache.get("markdown")).toBe(specialPrompt);
    });

    test("multiple invalidate calls are safe", () => {
      const cache = new PromptCache();
      cache.invalidate();
      cache.invalidate();
      cache.invalidate();

      expect(cache.isDirty()).toBe(true);
    });

    test("multiple clear calls are safe", () => {
      const cache = new PromptCache();
      cache.clear();
      cache.clear();
      cache.clear();

      expect(cache.isDirty()).toBe(true);
    });
  });

  describe("Cache lifecycle", () => {
    test("complete lifecycle: set -> get -> invalidate -> get", () => {
      const cache = new PromptCache();

      // Set
      cache.set("markdown", "test1");
      expect(cache.get("markdown")).toBe("test1");
      expect(cache.isDirty()).toBe(false);

      // Invalidate
      cache.invalidate();
      expect(cache.get("markdown")).toBeUndefined();
      expect(cache.isDirty()).toBe(true);

      // Set again
      cache.set("markdown", "test2");
      expect(cache.get("markdown")).toBe("test2");
      expect(cache.isDirty()).toBe(false);
    });

    test("independent format caching", () => {
      const cache = new PromptCache();

      cache.set("markdown", "md");
      expect(cache.get("markdown")).toBe("md");
      expect(cache.get("toon")).toBeUndefined();

      cache.set("toon", "tn");
      expect(cache.get("markdown")).toBe("md");
      expect(cache.get("toon")).toBe("tn");
      expect(cache.get("compact")).toBeUndefined();
    });
  });
});
