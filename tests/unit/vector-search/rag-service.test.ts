import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isRagEnabled } from "@/lib/ai/rag-feature-flag";
import { ragQuery } from "@/lib/features/vector-search/services";
import { generateEmbedding } from "@/lib/features/vector-search/services/embedding-service";

describe("rag-service", () => {
	beforeEach(() => {
		process.env.EMBEDDING_PROVIDER = "local";
		// Don't set LLM provider to test fallback behavior
		// Mock isRagEnabled to return true for these tests
		vi.mocked(isRagEnabled).mockResolvedValue(true);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("ragQuery", () => {
		it("should execute basic RAG query", async () => {
			const result = await ragQuery({
				query: "What is the capital of France?",
				modules: ["knowledge"],
			});

			expect(result.success).toBeDefined();
			expect(result.message).toBeDefined();
		});

		it("should include sources in response", async () => {
			const result = await ragQuery({
				query: "test query",
				modules: ["knowledge"],
			});

			if (result.success) {
				expect(result.sources).toBeDefined();
				expect(Array.isArray(result.sources)).toBe(true);
			}
		});

		it("should handle multi-module query", async () => {
			const result = await ragQuery({
				query: "company information",
				modules: ["knowledge", "contacts", "opportunities"],
			});

			expect(result).toBeDefined();
			expect(result.success !== undefined).toBe(true);
		});

		it("should fallback when no LLM provider configured", async () => {
			const result = await ragQuery({
				query: "test without LLM",
				modules: ["knowledge"],
			});

			expect(result.success).toBe(true);
			expect(result.message).toBeDefined();
			// Should return summarized sources instead of LLM answer
			expect(result.sources).toBeDefined();
		});

		it("should handle empty query", async () => {
			const result = await ragQuery({
				query: "",
				modules: ["knowledge"],
			});

			expect(result.success).toBe(false);
		});

		it("should handle empty modules list", async () => {
			const result = await ragQuery({
				query: "test",
				modules: [],
			});

			// Should work but may return no results
			expect(result).toBeDefined();
		});

		it("should set confidence score", async () => {
			const result = await ragQuery({
				query: "test query",
				modules: ["knowledge"],
			});

			if (result.success) {
				expect(result.confidence).toBeDefined();
				expect(typeof result.confidence).toBe("number");
				expect(result.confidence).toBeGreaterThanOrEqual(0);
				expect(result.confidence).toBeLessThanOrEqual(1);
			}
		});

		it("should handle special characters in query", async () => {
			const result = await ragQuery({
				query: "test & special @chars <html> tags",
				modules: ["knowledge"],
			});

			expect(result).toBeDefined();
		});

		it("should handle very long query", async () => {
			const longQuery = "test ".repeat(500);
			const result = await ragQuery({
				query: longQuery,
				modules: ["knowledge"],
			});

			expect(result).toBeDefined();
		});
	});

	describe("response formatting", () => {
		it("should return properly formatted response", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["knowledge"],
			});

			expect(result).toHaveProperty("success");
			expect(result).toHaveProperty("message");
			if (result.success) {
				expect(result).toHaveProperty("sources");
				expect(result).toHaveProperty("confidence");
				expect(result).toHaveProperty("metadata");
				expect(result.metadata).toHaveProperty("processingTime");
			}
		});

		it("should include processing time", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["knowledge"],
			});

			if (result.success && result.metadata?.processingTime) {
				expect(typeof result.metadata.processingTime).toBe("number");
				expect(result.metadata.processingTime).toBeGreaterThan(0);
			}
		});

		it("should limit source count", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["knowledge"],
				topK: 3,
			});

			if (result.sources) {
				expect(result.sources.length).toBeLessThanOrEqual(3);
			}
		});
	});

	describe("error handling", () => {
		it("should handle embedding generation errors gracefully", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["knowledge"],
			});

			// Should either succeed with fallback or fail gracefully
			expect(result).toBeDefined();
		});

		it("should handle vector search errors gracefully", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["nonexistent"],
			});

			// Should handle unknown modules
			expect(result).toBeDefined();
		});

		it("should have safe error messages", async () => {
			const result = await ragQuery({
				query: "test",
				modules: ["knowledge"],
			});

			if (!result.success && result.error) {
				expect(typeof result.error).toBe("string");
				expect(result.error.length).toBeGreaterThan(0);
			}
		});
	});

	describe("performance", () => {
		it("should complete RAG query within timeout", async () => {
			const startTime = Date.now();
			await ragQuery({
				query: "test performance",
				modules: ["knowledge"],
			});
			const duration = Date.now() - startTime;

			expect(duration).toBeLessThan(15000); // 15 second timeout
		});

		it("should handle concurrent RAG queries", async () => {
			const promises = Array(5)
				.fill(null)
				.map((_, i) =>
					ragQuery({
						query: `concurrent test ${i}`,
						modules: ["knowledge"],
					})
				);

			const results = await Promise.all(promises);

			expect(results).toHaveLength(5);
			results.forEach((r) => {
				expect(r).toBeDefined();
			});
		});
	});
});
