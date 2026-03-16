"use server";

import { isRagEnabled } from "@/lib/ai/rag-feature-flag";
import { prisma } from "@/lib/prisma";
import { getLogger } from "@/lib/utils/logger";

import { generateEmbedding } from "./embedding-service";
const logger = getLogger("indexing-service");
import type { IndexingParams, IndexingResult } from "@/lib/features/vector-search/types";

/**
 * Indexing Service
 * Responsible for creating, updating, and managing vector indexes
 * Called automatically on entity create/update, or manually for batch operations
 */

export async function indexEntity(sourceModule: string, sourceId: string, content: string, sourceType: string = "text", chunkIndex: number = 0): Promise<IndexingResult> {
	try {
		// Check if RAG is enabled
		const ragEnabled = await isRagEnabled();
		if (!ragEnabled) {
			logger.debug("RAG not enabled, skipping indexing");
			return { success: false, error: "RAG not enabled" };
		}

		if (!content || content.trim().length === 0) {
			return { success: false, error: "Content cannot be empty" };
		}

		logger.debug("Indexing entity", {
			sourceModule,
			sourceId,
			contentLength: content.length,
		});

		// Check if vector already exists
		const existing = await prisma.knowledgeVector.findFirst({
			where: {
				sourceModule,
				sourceId,
				sourceType,
				chunkIndex,
			},
		});

		// Generate embedding
		const embeddingResult = await generateEmbedding(content);
		if (!embeddingResult.success || !embeddingResult.embedding) {
			return {
				success: false,
				error: `Failed to generate embedding: ${embeddingResult.error}`,
			};
		}

		// Calculate hash for deduplication
		const contentHash = hashContent(content);

		const vectorData = {
			sourceModule,
			sourceId,
			sourceType,
			content,
			embedding: embeddingResult.embedding,
			embeddingModel: embeddingResult.model,
			chunkIndex,
			tokenCount: embeddingResult.tokenCount,
			hash: contentHash,
		};

		let result;
		if (existing) {
			// Update existing
			result = await prisma.knowledgeVector.update({
				where: { id: existing.id },
				data: {
					...vectorData,
					updatedAt: new Date(),
				},
			});
			logger.info("Vector updated", {
				id: result.id,
				sourceModule,
				sourceId,
			});
		} else {
			// Create new
			result = await prisma.knowledgeVector.create({
				data: vectorData,
			});
			logger.info("Vector created", {
				id: result.id,
				sourceModule,
				sourceId,
			});
		}

		return {
			success: true,
			vectorId: result.id,
			model: embeddingResult.model,
			dimension: embeddingResult.dimension,
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error("Entity indexing failed", { error: message });
		return { success: false, error: message };
	}
}

/**
 * Batch index multiple entities (for initial setup or migration)
 */
export async function batchIndexEntities(params: IndexingParams[]): Promise<IndexingResult[]> {
	logger.info("Batch indexing starting", { count: params.length });

	const results = await Promise.all(params.map((param) => indexEntity(param.sourceModule, param.sourceId, param.content, param.sourceType, param.chunkIndex)));

	const successful = results.filter((r) => r.success).length;
	const failed = results.length - successful;

	logger.info("Batch indexing completed", {
		total: params.length,
		successful,
		failed,
	});

	return results;
}

/**
 * Reindex entity (useful for updating after content changes)
 */
export async function reindexEntity(sourceModule: string, sourceId: string): Promise<number> {
	try {
		// Delete existing vectors
		await prisma.knowledgeVector.deleteMany({
			where: { sourceModule, sourceId },
		});

		logger.info("Entity vectors cleared", {
			sourceModule,
			sourceId,
		});

		return 1;
	} catch (error) {
		logger.error("Entity reindexing failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return 0;
	}
}

/**
 * Check indexing status
 */
export async function getIndexingStatus(): Promise<{
	totalVectors: number;
	byModule: Record<string, number>;
	lastIndexed: Date | null;
}> {
	try {
		const totalVectors = await prisma.knowledgeVector.count();

		const byModule: Record<string, number> = {};
		const moduleStats = await prisma.knowledgeVector.groupBy({
			by: ["sourceModule"],
			_count: true,
		});

		for (const stat of moduleStats) {
			byModule[stat.sourceModule] = stat._count;
		}

		const lastVector = await prisma.knowledgeVector.findFirst({
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		});

		return {
			totalVectors,
			byModule,
			lastIndexed: lastVector?.createdAt || null,
		};
	} catch (error) {
		logger.error("Failed to get indexing status", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { totalVectors: 0, byModule: {}, lastIndexed: null };
	}
}

/**
 * Clean up old/duplicate vectors
 */
export async function cleanupDuplicateVectors(): Promise<number> {
	try {
		// Find vectors with same hash and keep only latest
		const duplicates = await prisma.knowledgeVector.groupBy({
			by: ["hash"],
			where: { hash: { not: null } },
			having: { id: { _count: { gt: 1 } } },
		});

		let deletedCount = 0;

		for (const { hash } of duplicates) {
			const vectors = await prisma.knowledgeVector.findMany({
				where: { hash },
				orderBy: { createdAt: "desc" },
				skip: 1, // Keep latest, delete rest
			});

			if (vectors.length > 0) {
				const deleteResult = await prisma.knowledgeVector.deleteMany({
					where: {
						id: { in: vectors.map((v: any) => v.id) },
					},
				});
				deletedCount += deleteResult.count;
			}
		}

		logger.info("Duplicate vectors cleaned up", { count: deletedCount });
		return deletedCount;
	} catch (error) {
		logger.error("Cleanup failed", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return 0;
	}
}

/**
 * Simple hash function for content deduplication
 */
function hashContent(content: string): string {
	let hash = 0;
	for (let i = 0; i < content.length; i++) {
		const char = content.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return `hash_${Math.abs(hash)}`;
}
