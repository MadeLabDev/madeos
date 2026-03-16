/**
 * Vector Search Repository
 * Database operations for vector search and embeddings
 */

import { prisma } from "@/lib/prisma";

export class VectorSearchRepository {
	/**
	 * Search vectors by similarity using in-memory calculation
	 * Fetches candidate vectors and filters by similarity score
	 */
	static async findSimilarVectors(
		_queryEmbedding: number[],
		options: {
			topK?: number;
			minSimilarity?: number;
			sourceModule?: string;
			sourceId?: string;
			embeddingModel?: string;
		} = {},
	) {
		const { topK = 5, sourceModule, sourceId, embeddingModel } = options;

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
				knowledgeId: true,
			},
			take: topK * 3, // Fetch more to filter by similarity
		});

		return vectors;
	}

	/**
	 * Get vector by ID
	 */
	static async findById(id: string) {
		return prisma.knowledgeVector.findUnique({
			where: { id },
		});
	}

	/**
	 * Get all vectors for a knowledge article
	 */
	static async findByKnowledgeId(knowledgeId: string) {
		return prisma.knowledgeVector.findMany({
			where: { knowledgeId },
			orderBy: { chunkIndex: "asc" },
		});
	}

	/**
	 * Get vectors by entity (module + sourceId)
	 */
	static async findByEntity(sourceModule: string, sourceId: string) {
		return prisma.knowledgeVector.findMany({
			where: {
				sourceModule,
				sourceId,
			},
			orderBy: { chunkIndex: "asc" },
		});
	}

	/**
	 * Create a vector
	 */
	static async create(data: { knowledgeId?: string; sourceModule: string; sourceId: string; sourceType?: string; content: string; embedding?: string; embeddingModel?: string; chunkIndex?: number; tokenCount?: number; hash?: string }) {
		return prisma.knowledgeVector.create({
			data,
		});
	}

	/**
	 * Create many vectors (batch)
	 */
	static async createMany(data: any[]) {
		return prisma.knowledgeVector.createMany({
			data,
		});
	}

	/**
	 * Update a vector
	 */
	static async update(id: string, data: any) {
		return prisma.knowledgeVector.update({
			where: { id },
			data,
		});
	}

	/**
	 * Delete vectors by knowledge ID
	 */
	static async deleteByKnowledgeId(knowledgeId: string) {
		return prisma.knowledgeVector.deleteMany({
			where: { knowledgeId },
		});
	}

	/**
	 * Delete vectors by entity (module + sourceId)
	 */
	static async deleteByEntity(sourceModule: string, sourceId: string) {
		return prisma.knowledgeVector.deleteMany({
			where: {
				sourceModule,
				sourceId,
			},
		});
	}

	/**
	 * Get vector statistics
	 */
	static async getStats() {
		const [totalCount, byModule, lastCreated] = await Promise.all([
			prisma.knowledgeVector.count(),
			prisma.knowledgeVector.groupBy({
				by: ["sourceModule"],
				_count: true,
			}),
			prisma.knowledgeVector.findFirst({
				orderBy: { createdAt: "desc" },
				select: { createdAt: true },
			}),
		]);

		return {
			totalCount,
			byModule: byModule.map((m) => ({
				module: m.sourceModule,
				count: m._count,
			})),
			lastCreated: lastCreated?.createdAt,
		};
	}

	// ============================================================================
	// VECTOR SEARCH LOG
	// ============================================================================

	/**
	 * Create a search log entry
	 */
	static async createSearchLog(data: { query: string; topK?: number; minSimilarity?: number; resultKnowledgeIds?: string; similarityScores?: string; responseTimeMs?: number; modelUsed?: string; status?: string; userId?: string }) {
		return prisma.vectorSearchLog.create({
			data,
		});
	}

	/**
	 * Get search logs for user
	 */
	static async getUserSearchLogs(userId: string, options: { limit?: number; offset?: number } = {}) {
		const { limit = 50, offset = 0 } = options;

		return prisma.vectorSearchLog.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			skip: offset,
			take: limit,
		});
	}

	/**
	 * Get search analytics
	 */
	static async getSearchAnalytics(options: { days?: number } = {}) {
		const { days = 30 } = options;
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		const [totalSearches, avgResponseTime, modelStats, statusStats] = await Promise.all([
			prisma.vectorSearchLog.count({
				where: { createdAt: { gte: startDate } },
			}),
			prisma.vectorSearchLog.aggregate({
				where: { createdAt: { gte: startDate } },
				_avg: { responseTimeMs: true },
			}),
			prisma.vectorSearchLog.groupBy({
				by: ["modelUsed"],
				where: { createdAt: { gte: startDate } },
				_count: true,
			}),
			prisma.vectorSearchLog.groupBy({
				by: ["status"],
				where: { createdAt: { gte: startDate } },
				_count: true,
			}),
		]);

		return {
			totalSearches,
			avgResponseTime: avgResponseTime._avg.responseTimeMs ?? 0,
			byModel: modelStats.map((m) => ({
				model: m.modelUsed,
				count: m._count,
			})),
			byStatus: statusStats.map((s) => ({
				status: s.status,
				count: s._count,
			})),
		};
	}
}
