import { prisma } from "@/lib/prisma";

import type { CreateDesignBriefInput, DesignBriefStatus, DesignBriefWithRelations, GetDesignBriefsOptions, UpdateDesignBriefInput } from "../types/design-brief.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * DesignBrief Repository
 * Direct database operations for design briefs
 */

export class DesignBriefRepository {
	/**
	 * Get all design briefs with filters and pagination
	 */
	static async getAllDesignBriefs(options: GetDesignBriefsOptions = {}) {
		const { page = 1, pageSize = 10, designProjectId, status, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (designProjectId) {
			where.designProjectId = designProjectId;
		}

		if (status) {
			where.status = status;
		}

		if (search) {
			where.OR = [{ brandAssets: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { targetAudience: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { notes: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [designBriefs, total] = await Promise.all([
			prisma.designBrief.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					designProject: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.designBrief.count({ where }),
		]);

		return {
			designBriefs,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get design brief by ID
	 */
	static async getDesignBriefById(id: string): Promise<DesignBriefWithRelations | null> {
		return prisma.designBrief.findUnique({
			where: { id },
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get design brief by design project
	 */
	static async getDesignBriefByProject(designProjectId: string): Promise<DesignBriefWithRelations | null> {
		return prisma.designBrief.findUnique({
			where: { designProjectId },
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new design brief
	 */
	static async createDesignBrief(data: CreateDesignBriefInput, userId?: string): Promise<DesignBriefWithRelations> {
		return prisma.designBrief.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing design brief
	 */
	static async updateDesignBrief(id: string, data: UpdateDesignBriefInput, userId?: string): Promise<DesignBriefWithRelations> {
		return prisma.designBrief.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a design brief
	 */
	static async deleteDesignBrief(id: string): Promise<DesignBriefWithRelations> {
		return prisma.designBrief.delete({
			where: { id },
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Approve a design brief
	 */
	static async approveDesignBrief(id: string, userId?: string): Promise<DesignBriefWithRelations> {
		return prisma.designBrief.update({
			where: { id },
			data: {
				status: "APPROVED",
				approvedAt: new Date(),
				approvedBy: userId,
				updatedBy: userId,
			},
			include: {
				designProject: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of design briefs by status
	 */
	static async getDesignBriefCountByStatus(): Promise<Record<DesignBriefStatus, number>> {
		const counts = await prisma.designBrief.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<DesignBriefStatus, number>;
	}
}
