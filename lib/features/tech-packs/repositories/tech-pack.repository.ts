import { prisma } from "@/lib/prisma";

import type { CreateTechPackInput, GetTechPacksOptions, TechPackStatus, TechPackWithRelations, UpdateTechPackInput } from "../types/tech-pack.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * TechPack Repository
 * Direct database operations for tech packs
 */

export class TechPackRepository {
	/**
	 * Get all tech packs with filters and pagination
	 */
	static async getAllTechPacks(options: GetTechPacksOptions = {}) {
		const { page = 1, pageSize = 10, productDesignId, status, decorationMethod, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (productDesignId) {
			where.productDesignId = productDesignId;
		}

		if (status) {
			where.status = status;
		}

		if (decorationMethod) {
			where.decorationMethod = { contains: decorationMethod, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) };
		}

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { productionNotes: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [techPacks, total] = await Promise.all([
			prisma.techPack.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					productDesign: {
						select: {
							id: true,
							name: true,
							status: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.techPack.count({ where }),
		]);

		return {
			techPacks,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get tech pack by ID
	 */
	static async getTechPackById(id: string): Promise<TechPackWithRelations | null> {
		return prisma.techPack.findUnique({
			where: { id },
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get tech pack by product design
	 */
	static async getTechPackByProductDesign(productDesignId: string): Promise<TechPackWithRelations | null> {
		return prisma.techPack.findUnique({
			where: { productDesignId },
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new tech pack
	 */
	static async createTechPack(data: CreateTechPackInput, userId?: string): Promise<TechPackWithRelations> {
		return prisma.techPack.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing tech pack
	 */
	static async updateTechPack(id: string, data: UpdateTechPackInput, userId?: string): Promise<TechPackWithRelations> {
		return prisma.techPack.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a tech pack
	 */
	static async deleteTechPack(id: string): Promise<TechPackWithRelations> {
		return prisma.techPack.delete({
			where: { id },
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Approve a tech pack
	 */
	static async approveTechPack(id: string, userId?: string): Promise<TechPackWithRelations> {
		return prisma.techPack.update({
			where: { id },
			data: {
				status: "APPROVED",
				approvedAt: new Date(),
				approvedBy: userId,
				updatedBy: userId,
			},
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Finalize a tech pack
	 */
	static async finalizeTechPack(id: string, userId?: string): Promise<TechPackWithRelations> {
		return prisma.techPack.update({
			where: { id },
			data: {
				status: "FINALIZED",
				updatedBy: userId,
			},
			include: {
				productDesign: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of tech packs by status
	 */
	static async getTechPackCountByStatus(): Promise<Record<TechPackStatus, number>> {
		const counts = await prisma.techPack.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<TechPackStatus, number>;
	}
}
