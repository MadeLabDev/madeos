import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	generateBatchEmbeddings,
	generateEmbedding,
} from "@/lib/features/vector-search/services/embedding-service";
import { calculateSimilarity } from "@/lib/utils/similarity";

describe("embedding-service", () => {
	beforeEach(() => {
		// Setup environment for tests
		process.env.EMBEDDING_PROVIDER = "local";
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("generateEmbedding", () => {
		it("should generate embedding for valid text", async () => {
			const result = await generateEmbedding("Hello world");

			expect(result.success).toBe(true);
			expect(result.embedding).toBeDefined();
			expect(typeof result.embedding).toBe("string");
			expect(result.embedding?.length).toBeGreaterThan(0);
		});

		it("should handle empty text", async () => {
			const result = await generateEmbedding("");

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should handle very long text", async () => {
			const longText = "Hello ".repeat(1000);
			const result = await generateEmbedding(longText);

			expect(result.success).toBe(true);
			expect(result.embedding).toBeDefined();
		});

		it("should return consistent results for same text", async () => {
			const text = "Test consistency";
			const result1 = await generateEmbedding(text);
			const result2 = await generateEmbedding(text);

			if (result1.success && result2.success) {
				expect(result1.embedding).toEqual(result2.embedding);
			}
		});
	});

	describe("generateBatchEmbeddings", () => {
		it("should generate embeddings for multiple texts", async () => {
			const texts = ["Hello", "World", "Test"];
			const result = await generateBatchEmbeddings(texts);

			expect(result.success).toBe(true);
			expect(result.embeddings).toBeDefined();
			expect(result.embeddings?.length).toBe(3);
		});

		it("should handle empty array", async () => {
			const result = await generateBatchEmbeddings([]);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should handle mixed valid and invalid inputs", async () => {
			const texts = ["Valid text", "", "Another valid"];
			const result = await generateBatchEmbeddings(texts);

			// Should process successfully but skip empty ones
			expect(result.success).toBe(true);
		});

		it("should handle large batches", async () => {
			const texts = Array(100)
				.fill(null)
				.map((_, i) => `Text ${i}`);
			const result = await generateBatchEmbeddings(texts);

			expect(result.success).toBe(true);
			expect(result.embeddings?.length).toBeLessThanOrEqual(100);
		});
	});

	describe("calculateSimilarity", () => {
		it("should return 1 for identical vectors", () => {
			const vector1 = JSON.stringify([1, 0, 0, 0]);
			const vector2 = JSON.stringify([1, 0, 0, 0]);

			const similarity = calculateSimilarity(vector1, vector2);

			expect(similarity).toBeCloseTo(1, 5);
		});

		it("should return 0 for orthogonal vectors", () => {
			const vector1 = JSON.stringify([1, 0, 0, 0]);
			const vector2 = JSON.stringify([0, 1, 0, 0]);

			const similarity = calculateSimilarity(vector1, vector2);

			expect(similarity).toBeCloseTo(0, 5);
		});

		it("should return -1 for opposite vectors", () => {
			const vector1 = JSON.stringify([1, 0, 0, 0]);
			const vector2 = JSON.stringify([-1, 0, 0, 0]);

			const similarity = calculateSimilarity(vector1, vector2);

			expect(similarity).toBeCloseTo(-1, 5);
		});

		it("should handle empty vectors", () => {
			const vector1 = JSON.stringify([]);
			const vector2 = JSON.stringify([]);

			const similarity = calculateSimilarity(vector1, vector2);

			expect(similarity).toBe(0);
		});

		it("should be symmetric", () => {
			const vector1 = JSON.stringify([1, 2, 3, 4]);
			const vector2 = JSON.stringify([2, 3, 4, 5]);

			const similarity1 = calculateSimilarity(vector1, vector2);
			const similarity2 = calculateSimilarity(vector2, vector1);

			expect(similarity1).toBeCloseTo(similarity2, 5);
		});

		it("should handle vectors of different magnitudes", () => {
			const vector1 = JSON.stringify([1, 1, 1, 1]);
			const vector2 = JSON.stringify([10, 10, 10, 10]);

			const similarity = calculateSimilarity(vector1, vector2);

			expect(similarity).toBeCloseTo(1, 5);
		});
	});

	describe("error handling", () => {
		it("should handle provider errors gracefully", async () => {
			// When provider is not configured
			process.env.EMBEDDING_PROVIDER = "invalid-provider";

			const result = await generateEmbedding("Test");

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it("should return safe error messages", async () => {
			const result = await generateEmbedding("");

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error).toBe("Text cannot be empty");
		});
	});
});
