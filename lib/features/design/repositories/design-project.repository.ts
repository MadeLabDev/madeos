/**
 * DesignProject Repository
 * Database operations for DesignProjects
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateDesignProjectInput, DesignProjectFilters, DesignProjectWithRelations, UpdateDesignProjectInput } from "../types";

export class DesignProjectRepository {
	/**
	 * Find design project by ID with relations
	 */
	static async findById(id: string): Promise<DesignProjectWithRelations | null> {
		const result = await prisma.designProject.findUnique({
			where: { id },
			include: {
				engagement: true,
				customer: true,
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
		});
		return result as DesignProjectWithRelations | null;
	}

	/**
	 * Find multiple design projects with pagination and filters
	 */
	static async findMany(filters: DesignProjectFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignProjectWithRelations[]> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.customerId) where.customerId = filters.customerId;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;
		if (filters.requestedBy) where.requestedBy = filters.requestedBy;

		if (filters.dueDate) {
			where.dueDate = {
				lte: filters.dueDate,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const results = await prisma.designProject.findMany({
			where,
			include: {
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return results as DesignProjectWithRelations[];
	}

	/**
	 * Count design projects with filters
	 */
	static async count(filters: DesignProjectFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.customerId) where.customerId = filters.customerId;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;
		if (filters.requestedBy) where.requestedBy = filters.requestedBy;

		if (filters.dueDate) {
			where.dueDate = {
				lte: filters.dueDate,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.designProject.count({ where });
	}

	/**
	 * Create new design project
	 */
	static async create(input: CreateDesignProjectInput & { createdBy: string }): Promise<DesignProjectWithRelations> {
		const result = await prisma.designProject.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
			include: {
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
		});
		return result as DesignProjectWithRelations;
	}

	/**
	 * Update design project
	 */
	static async update(id: string, input: UpdateDesignProjectInput & { updatedBy: string }): Promise<DesignProjectWithRelations> {
		const result = await prisma.designProject.update({
			where: { id },
			data: input,
			include: {
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
		});
		return result as DesignProjectWithRelations;
	}

	/**
	 * Delete design project (cascades to related data)
	 */
	static async delete(id: string): Promise<void> {
		await prisma.designProject.delete({
			where: { id },
		});
	}

	/**
	 * Delete multiple design projects
	 */
	static async deleteMany(ids: string[]): Promise<{ count: number }> {
		return prisma.designProject.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	}

	/**
	 * Find projects by engagement ID
	 */
	static async findByEngagementId(engagementId: string): Promise<DesignProjectWithRelations[]> {
		const results = await prisma.designProject.findMany({
			where: { engagementId },
			include: {
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return results as DesignProjectWithRelations[];
	}

	/**
	 * Find projects by customer ID
	 */
	static async findByCustomerId(customerId: string): Promise<DesignProjectWithRelations[]> {
		const results = await prisma.designProject.findMany({
			where: { customerId },
			include: {
				brief: true,
				designs: true,
				deck: true,
				reviews: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return results as DesignProjectWithRelations[];
	}
}
