import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("similarity-utils");

/**
 * Calculate similarity between two embedding vectors
 * Returns 0-1 score (1 = identical, 0 = completely different)
 * Pure utility function - no side effects, safe for client or server
 */
export function calculateSimilarity(embedding1: string, embedding2: string): number {
	try {
		const vec1 = JSON.parse(embedding1) as number[];
		const vec2 = JSON.parse(embedding2) as number[];

		if (vec1.length !== vec2.length) {
			logger.warn("Embedding vectors have different dimensions", {
				dim1: vec1.length,
				dim2: vec2.length,
			});
			return 0;
		}

		// Using cosine similarity
		const dotProduct = vec1.reduce((acc, val, i) => acc + val * (vec2[i] || 0), 0);
		const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
		const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));

		if (mag1 === 0 || mag2 === 0) return 0;
		return dotProduct / (mag1 * mag2);
	} catch (error) {
		logger.error("Similarity calculation failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return 0;
	}
}
