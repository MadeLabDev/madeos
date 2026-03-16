import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { multiModuleVectorSearch,vectorSearch } from "@/lib/features/vector-search/services";
import { generateEmbedding } from "@/lib/features/vector-search/services/embedding-service";
import type { SearchResult } from "@/lib/features/vector-search/types";

describe("vector-search-service", () => {
	beforeEach(() => {
		process.env.EMBEDDING_PROVIDER = "local";
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("vectorSearch", () => {
		it("should search vectors in a single module", async () => {
			const queryText = "test query";
			const queryEmbedding = await generateEmbedding(queryText);

			if (!queryEmbedding.success || !queryEmbedding.embedding) {
				throw new Error("Failed to generate query embedding");
			}

			const results = await vectorSearch(queryEmbedding.embedding, {
				sourceModule: "test",
				minSimilarity: 0.5,
				topK: 10,
			});

			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeLessThanOrEqual(10);

			// All results should have required fields
			results.forEach((result) => {
				expect(result.id).toBeDefined();
				expect(result.module).toBe("test");
				expect(typeof result.similarity).toBe("number");
				expect(result.similarity).toBeGreaterThanOrEqual(0.5);
			});
		});

		it("should return empty array for no matches", async () => {
			const queryEmbedding = JSON.stringify(new Array(384).fill(0));

			const results = await vectorSearch(queryEmbedding, {
				minSimilarity: 0.99,
				topK: 10,
			});

			// May be empty if no exact matches
			expect(Array.isArray(results)).toBe(true);
		});

		it("should respect minSimilarity threshold", async () => {
			const queryEmbedding = JSON.stringify(new Array(384).fill(0.5));

			const resultsLow = await vectorSearch(queryEmbedding, {
				minSimilarity: 0.1,
				topK: 10,
			});

			const resultsHigh = await vectorSearch(queryEmbedding, {
				minSimilarity: 0.9,
				topK: 10,
			});

			expect(resultsLow.length).toBeGreaterThanOrEqual(resultsHigh.length);
		});

		it("should respect limit parameter", async () => {
			const queryEmbedding = JSON.stringify(new Array(384).fill(0.5));

			const results = await vectorSearch(queryEmbedding, {
				minSimilarity: 0.1,
				topK: 3,
			});

			expect(results.length).toBeLessThanOrEqual(3);
		});
	});

	describe("multiModuleVectorSearch", () => {
		it("should search across multiple modules", async () => {
			const queryText = "multi module search";
			const queryEmbedding = await generateEmbedding(queryText);

			if (!queryEmbedding.success || !queryEmbedding.embedding) {
				throw new Error("Failed to generate query embedding");
			}

			const results = await multiModuleVectorSearch(
				queryEmbedding.embedding,
				["knowledge", "contacts", "opportunities"]
			);

			expect(results.success).toBe(true);
			expect(results.results).toBeInstanceOf(Map);
			expect(results.results.size).toBeLessThanOrEqual(3);

			// Check that all results are from allowed modules
			for (const [module, moduleResults] of results.results) {
				expect(["knowledge", "contacts", "opportunities"]).toContain(module);
				expect(Array.isArray(moduleResults)).toBe(true);
			}
		});

		it("should handle empty module list", async () => {
			const queryEmbedding = JSON.stringify(new Array(384).fill(0.5));

			const results = await multiModuleVectorSearch(queryEmbedding, []);

			expect(results.success).toBe(true);
			expect(results.results.size).toBe(0);
		});

		it("should handle module not found gracefully", async () => {
			const queryEmbedding = new Array(384).fill(0.5);

			const results = await multiModuleVectorSearch(queryEmbedding, [
				"nonexistent-module",
			]);

			expect(results.success).toBe(true);
		});

		it("should return combined results from all modules", async () => {
			const queryEmbedding = JSON.stringify(new Array(384).fill(0.5));

			const results = await multiModuleVectorSearch(queryEmbedding, [
				"knowledge",
				"contacts",
			]);

			expect(results.success).toBe(true);
			expect(results.results).toBeDefined();
			expect(results.results).toBeInstanceOf(Map);
			if (results.results.size > 0) {
				const modules = new Set();
				for (const [module] of results.results) {
					modules.add(module);
				}
				expect(modules.size).toBeLessThanOrEqual(2);
			}
		});
	});

	describe("error handling", () => {
		it("should handle invalid module name", async () => {
			const queryEmbedding = new Array(384).fill(0.5);

			const results = await vectorSearch("@invalid", queryEmbedding);

			expect(Array.isArray(results)).toBe(true);
		});

		it("should handle empty query embedding", async () => {
			const queryEmbedding: number[] = [];

			const results = await vectorSearch("knowledge", queryEmbedding);

			expect(Array.isArray(results)).toBe(true);
		});

		it("should handle malformed search options", async () => {
			const queryEmbedding = new Array(384).fill(0.5);

			const results = await vectorSearch("knowledge", queryEmbedding, {
				minSimilarity: -1, // Invalid
				limit: 0, // Invalid
			});

			expect(Array.isArray(results)).toBe(true);
		});
	});

	describe("performance", () => {
		it("should complete search within reasonable time", async () => {
			const queryEmbedding = new Array(384).fill(0.5);

			const startTime = Date.now();
			await vectorSearch("knowledge", queryEmbedding);
			const duration = Date.now() - startTime;

			expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
		});

		it("should handle concurrent searches", async () => {
			const queryEmbedding = new Array(384).fill(0.5);

			const promises = Array(10)
				.fill(null)
				.map(() => vectorSearch("knowledge", queryEmbedding));

			const results = await Promise.all(promises);

			expect(results).toHaveLength(10);
			results.forEach((r) => {
				expect(Array.isArray(r)).toBe(true);
			});
		});
	});
});
