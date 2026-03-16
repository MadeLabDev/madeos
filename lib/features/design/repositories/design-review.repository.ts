/**
 * DesignReview Repository
 * Database operations for DesignReviews
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateDesignReviewInput, DesignReviewFilters, DesignReviewWithRelations, UpdateDesignReviewInput } from "../types";

export class DesignReviewRepository {
	/**
	 * Find design review by ID
	 */
	static async findById(id: string): Promise<DesignReviewWithRelations | null> {
		const result = await prisma.designReview.findUnique({
			where: { id },
			include: {
				designProject: true,
				productDesign: true,
			},
		});
		return result as DesignReviewWithRelations | null;
	}

	/**
	 * Find multiple reviews with filters
	 */
	static async findMany(filters: DesignReviewFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignReviewWithRelations[]> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.productDesignId) where.productDesignId = filters.productDesignId;
		if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ reviewerName: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { feedback: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const results = await prisma.designReview.findMany({
			where,
			include: {
				designProject: true,
				productDesign: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return results as DesignReviewWithRelations[];
	}

	/**
	 * Count reviews
	 */
	static async count(filters: DesignReviewFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.productDesignId) where.productDesignId = filters.productDesignId;
		if (filters.approvalStatus) where.approvalStatus = filters.approvalStatus;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ reviewerName: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { feedback: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.designReview.count({ where });
	}

	/**
	 * Create new review
	 */
	static async create(input: CreateDesignReviewInput & { createdBy: string }): Promise<DesignReviewWithRelations> {
		const result = await prisma.designReview.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
			include: {
				designProject: true,
				productDesign: true,
			},
		});
		return result as DesignReviewWithRelations;
	}

	/**
	 * Update review
	 */
	static async update(id: string, input: UpdateDesignReviewInput & { updatedBy: string }): Promise<DesignReviewWithRelations> {
		const result = await prisma.designReview.update({
			where: { id },
			data: input,
			include: {
				designProject: true,
				productDesign: true,
			},
		});
		return result as DesignReviewWithRelations;
	}

	/**
	 * Delete review
	 */
	static async delete(id: string): Promise<void> {
		await prisma.designReview.delete({
			where: { id },
		});
	}

	/**
	 * Find reviews by project ID
	 */
	static async findByProjectId(projectId: string): Promise<DesignReviewWithRelations[]> {
		const results = await prisma.designReview.findMany({
			where: { designProjectId: projectId },
			include: {
				designProject: true,
				productDesign: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return results as DesignReviewWithRelations[];
	}

	/**
	 * Find reviews by design ID
	 */
	static async findByDesignId(designId: string): Promise<DesignReviewWithRelations[]> {
		const results = await prisma.designReview.findMany({
			where: { productDesignId: designId },
			include: {
				designProject: true,
				productDesign: true,
			},
			orderBy: { createdAt: "desc" },
		});
		return results as DesignReviewWithRelations[];
	}
}
