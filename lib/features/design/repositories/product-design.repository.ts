/**
 * ProductDesign Repository
 * Database operations for ProductDesigns
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateProductDesignInput, ProductDesignFilters, ProductDesignWithRelations, UpdateProductDesignInput } from "../types";

export class ProductDesignRepository {
	/**
	 * Find product design by ID with relations
	 */
	static async findById(id: string): Promise<ProductDesignWithRelations | null> {
		const result = await prisma.productDesign.findUnique({
			where: { id },
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
		});
		return result as ProductDesignWithRelations | null;
	}

	/**
	 * Find multiple product designs with pagination and filters
	 */
	static async findMany(filters: ProductDesignFilters = {}, options: { skip?: number; take?: number } = {}): Promise<ProductDesignWithRelations[]> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.designType) where.designType = filters.designType;
		if (filters.productType) where.productType = filters.productType;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const results = await prisma.productDesign.findMany({
			where,
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return results as ProductDesignWithRelations[];
	}

	/**
	 * Count product designs
	 */
	static async count(filters: ProductDesignFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.designType) where.designType = filters.designType;
		if (filters.productType) where.productType = filters.productType;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.productDesign.count({ where });
	}

	/**
	 * Create new product design
	 */
	static async create(input: CreateProductDesignInput & { createdBy: string }): Promise<ProductDesignWithRelations> {
		const result = await prisma.productDesign.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
		});
		return result as ProductDesignWithRelations;
	}

	/**
	 * Update product design
	 */
	static async update(id: string, input: UpdateProductDesignInput & { updatedBy: string }): Promise<ProductDesignWithRelations> {
		const result = await prisma.productDesign.update({
			where: { id },
			data: input,
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
		});
		return result as ProductDesignWithRelations;
	}

	/**
	 * Delete product design
	 */
	static async delete(id: string): Promise<void> {
		await prisma.productDesign.delete({
			where: { id },
		});
	}

	/**
	 * Delete multiple product designs
	 */
	static async deleteMany(ids: string[]): Promise<{ count: number }> {
		return prisma.productDesign.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	}

	/**
	 * Find designs by project ID
	 */
	static async findByProjectId(projectId: string): Promise<ProductDesignWithRelations[]> {
		return prisma.productDesign.findMany({
			where: { designProjectId: projectId },
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Find design versions (by parent ID)
	 */
	static async findVersions(parentDesignId: string): Promise<ProductDesignWithRelations[]> {
		return prisma.productDesign.findMany({
			where: { parentDesignId },
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
			orderBy: { version: "desc" },
		});
	}

	/**
	 * Find designs by IDs
	 */
	static async findByIds(ids: string[]): Promise<ProductDesignWithRelations[]> {
		return prisma.productDesign.findMany({
			where: { id: { in: ids } },
			include: {
				designProject: true,
				versions: true,
				techPack: true,
				reviews: true,
			},
		});
	}
}
