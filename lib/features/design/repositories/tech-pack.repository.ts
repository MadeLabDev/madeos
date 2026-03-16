/**
 * TechPack Repository
 * Database operations for TechPacks
 */

import { prisma } from "@/lib/prisma";

import { CreateTechPackInput, TechPack, TechPackFilters, UpdateTechPackInput } from "../types";

export class TechPackRepository {
	/**
	 * Find tech pack by ID
	 */
	static async findById(id: string): Promise<TechPack | null> {
		return prisma.techPack.findUnique({
			where: { id },
		});
	}

	/**
	 * Find tech pack by product design ID (one per design)
	 */
	static async findByDesignId(designId: string): Promise<TechPack | null> {
		return prisma.techPack.findUnique({
			where: { productDesignId: designId },
		});
	}

	/**
	 * Find multiple tech packs with filters
	 */
	static async findMany(filters: TechPackFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TechPack[]> {
		const where: any = {};

		if (filters.productDesignId) where.productDesignId = filters.productDesignId;
		if (filters.decorationMethod) where.decorationMethod = filters.decorationMethod;
		if (filters.status) where.status = filters.status;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		return prisma.techPack.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count tech packs
	 */
	static async count(filters: TechPackFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.productDesignId) where.productDesignId = filters.productDesignId;
		if (filters.decorationMethod) where.decorationMethod = filters.decorationMethod;
		if (filters.status) where.status = filters.status;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		return prisma.techPack.count({ where });
	}

	/**
	 * Create new tech pack
	 */
	static async create(input: CreateTechPackInput & { createdBy: string }): Promise<TechPack> {
		return prisma.techPack.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
		});
	}

	/**
	 * Update tech pack
	 */
	static async update(id: string, input: UpdateTechPackInput & { updatedBy: string }): Promise<TechPack> {
		return prisma.techPack.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete tech pack
	 */
	static async delete(id: string): Promise<void> {
		await prisma.techPack.delete({
			where: { id },
		});
	}

	/**
	 * Delete multiple tech packs
	 */
	static async deleteMany(ids: string[]): Promise<{ count: number }> {
		return prisma.techPack.deleteMany({
			where: {
				id: { in: ids },
			},
		});
	}
}
