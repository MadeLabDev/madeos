"use server";

import { prisma } from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";
import { calculateSimilarity } from "@/lib/utils/similarity";
const logger = getLogger("vector-search-service");
import type { VectorSearchParams, VectorSearchResult } from "@/lib/features/vector-search/types";

/**
 * Vector Search Service
 * Performs similarity search on stored vectors to find relevant content
 * Used by RAG pipeline to retrieve context for LLM
 */

export async function vectorSearch(
	queryEmbedding: string, // JSON string of embedding
	params: VectorSearchParams = {},
): Promise<VectorSearchResult[]> {
	const { topK = 5, minSimilarity = 0.6, sourceModule, sourceId, embeddingModel } = params;

	try {
		logger.debug("Vector search starting", {
			topK,
			minSimilarity,
			sourceModule,
			filters: !!sourceModule,
		});

		// Fetch vectors from database (we'll do similarity calculation in-memory)
		// In production with pgvector, this would use SQL similarity operators
		const vectors = await prisma.knowledgeVector.findMany({
			where: {
				...(sourceModule && { sourceModule }),
				...(sourceId && { sourceId }),
				...(embeddingModel && { embeddingModel }),
				embedding: { not: null },
			},
			select: {
				id: true,
				sourceModule: true,
				sourceId: true,
				sourceType: true,
				content: true,
				embedding: true,
				embeddingModel: true,
				chunkIndex: true,
			},
			take: topK * 3, // Fetch more to filter by similarity
		});

		logger.debug("Vectors fetched", { count: vectors.length });

		if (vectors.length === 0) {
			logger.info("No vectors found for search");
			return [];
		}

		// Calculate similarity for each vector
		const scored = vectors
			.map((vector: any) => {
				if (!vector.embedding) return null;

				const similarity = calculateSimilarity(queryEmbedding, vector.embedding);

				if (similarity < minSimilarity) return null;

				return {
					id: vector.id,
					sourceModule: vector.sourceModule,
					sourceId: vector.sourceId,
					sourceType: vector.sourceType,
					content: vector.content,
					similarity,
					chunkIndex: vector.chunkIndex,
				};
			})
			.filter((item) => item !== null) as VectorSearchResult[];

		// Sort by similarity and limit to topK
		const results = scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);

		logger.debug("Vector search completed", {
			resultsCount: results.length,
			avgSimilarity: results.length > 0 ? (results.reduce((sum, r) => sum + r.similarity, 0) / results.length).toFixed(3) : 0,
		});

		return results;
	} catch (error) {
		logger.error("Vector search failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return [];
	}
}

/**
 * Multi-module vector search (respects RBAC permissions)
 * Searches across multiple modules but only returns results user can access
 */
export async function multiModuleVectorSearch(
	queryEmbedding: string,
	allowedModules: string[], // Modules user has read permission for
	params?: VectorSearchParams,
): Promise<{ success: boolean; results: Map<string, VectorSearchResult[]>; message?: string }> {
	try {
		const results = new Map<string, VectorSearchResult[]>();

		// Search each module in parallel
		const searchPromises = allowedModules.map(async (module) => {
			const moduleResults = await vectorSearch(queryEmbedding, {
				...params,
				sourceModule: module,
			});
			return { module, results: moduleResults };
		});

		const searches = await Promise.all(searchPromises);

		// Aggregate results by module
		for (const { module, results: moduleResults } of searches) {
			if (moduleResults.length > 0) {
				results.set(module, moduleResults);
			}
		}

		logger.debug("Multi-module search completed", {
			modules: allowedModules.length,
			resultsFound: results.size,
		});

		return { success: true, results };
	} catch (error) {
		logger.error("Multi-module vector search failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { success: false, results: new Map(), message: error instanceof Error ? error.message : "Unknown error" };
	}
}

/**
 * Get vectors by entity (used for related items)
 */
export async function getVectorsByEntity(sourceModule: string, sourceId: string): Promise<VectorSearchResult[]> {
	try {
		const vectors = await prisma.knowledgeVector.findMany({
			where: { sourceModule, sourceId },
			select: {
				id: true,
				sourceModule: true,
				sourceId: true,
				sourceType: true,
				content: true,
				embedding: true,
				chunkIndex: true,
			},
		});

		return vectors.map((v) => ({
			id: v.id,
			sourceModule: v.sourceModule,
			sourceId: v.sourceId,
			sourceType: v.sourceType,
			content: v.content,
			similarity: 1, // Own entity vectors
			chunkIndex: v.chunkIndex,
		}));
	} catch (error) {
		logger.error("Failed to get entity vectors", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return [];
	}
}

/**
 * Delete vectors for an entity (called when entity is deleted)
 */
export async function deleteVectorsByEntity(sourceModule: string, sourceId: string): Promise<number> {
	try {
		const result = await prisma.knowledgeVector.deleteMany({
			where: { sourceModule, sourceId },
		});

		logger.info("Vectors deleted", {
			sourceModule,
			sourceId,
			count: result.count,
		});

		return result.count;
	} catch (error) {
		logger.error("Failed to delete vectors", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return 0;
	}
}
