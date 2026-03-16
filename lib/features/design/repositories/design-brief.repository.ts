/**
 * DesignBrief Repository
 * Database operations for DesignBriefs
 */

import { prisma } from "@/lib/prisma";

import { CreateDesignBriefInput, DesignBrief, DesignBriefFilters, DesignBriefWithRelations, UpdateDesignBriefInput } from "../types";

export class DesignBriefRepository {
	/**
	 * Find design brief by ID
	 */
	static async findById(id: string): Promise<DesignBriefWithRelations | null> {
		const result = await prisma.designBrief.findUnique({
			where: { id },
			include: {
				designProject: true,
			},
		});
		return result as DesignBriefWithRelations | null;
	}

	/**
	 * Find brief by project ID (one per project)
	 */
	static async findByProjectId(projectId: string): Promise<DesignBrief | null> {
		return prisma.designBrief.findUnique({
			where: { designProjectId: projectId },
		});
	}

	/**
	 * Find multiple briefs with filters
	 */
	static async findMany(filters: DesignBriefFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignBriefWithRelations[]> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.status) where.status = filters.status;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		const results = await prisma.designBrief.findMany({
			where,
			include: {
				designProject: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return results as DesignBriefWithRelations[];
	}

	/**
	 * Count briefs
	 */
	static async count(filters: DesignBriefFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.status) where.status = filters.status;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		return prisma.designBrief.count({ where });
	}

	/**
	 * Create new brief
	 */
	static async create(input: CreateDesignBriefInput & { createdBy: string }): Promise<DesignBrief> {
		return prisma.designBrief.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
		});
	}

	/**
	 * Update brief
	 */
	static async update(id: string, input: UpdateDesignBriefInput & { updatedBy: string }): Promise<DesignBrief> {
		return prisma.designBrief.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete brief
	 */
	static async delete(id: string): Promise<void> {
		await prisma.designBrief.delete({
			where: { id },
		});
	}

	/**
	 * Delete multiple briefs
	 */
	static async deleteMany(ids: string[]): Promise<{ count: number }> {
		return prisma.designBrief.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	}
}
