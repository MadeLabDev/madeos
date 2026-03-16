/**
 * DesignDeck Repository
 * Database operations for DesignDecks
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateDesignDeckInput, DesignDeckFilters, DesignDeckWithRelations, UpdateDesignDeckInput } from "../types";

export class DesignDeckRepository {
	/**
	 * Find design deck by ID
	 */
	static async findById(id: string): Promise<DesignDeckWithRelations | null> {
		const result = await prisma.designDeck.findUnique({
			where: { id },
			include: {
				designProject: true,
			},
		});
		return result as DesignDeckWithRelations | null;
	}

	/**
	 * Find deck by project ID (one per project)
	 */
	static async findByProjectId(projectId: string): Promise<DesignDeckWithRelations | null> {
		const result = await prisma.designDeck.findUnique({
			where: { designProjectId: projectId },
			include: {
				designProject: true,
			},
		});
		return result as DesignDeckWithRelations | null;
	}

	/**
	 * Find multiple decks with filters
	 */
	static async findMany(filters: DesignDeckFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignDeckWithRelations[]> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.status) where.status = filters.status;

		if (filters.publishedAfter || filters.publishedBefore) {
			where.publishedAt = {};
			if (filters.publishedAfter) where.publishedAt.gte = filters.publishedAfter;
			if (filters.publishedBefore) where.publishedAt.lte = filters.publishedBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const results = await prisma.designDeck.findMany({
			where,
			include: {
				designProject: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
		return results as DesignDeckWithRelations[];
	}

	/**
	 * Count decks
	 */
	static async count(filters: DesignDeckFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.designProjectId) where.designProjectId = filters.designProjectId;
		if (filters.status) where.status = filters.status;

		if (filters.publishedAfter || filters.publishedBefore) {
			where.publishedAt = {};
			if (filters.publishedAfter) where.publishedAt.gte = filters.publishedAfter;
			if (filters.publishedBefore) where.publishedAt.lte = filters.publishedBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.designDeck.count({ where });
	}

	/**
	 * Create new deck
	 */
	static async create(input: CreateDesignDeckInput & { createdBy: string }): Promise<DesignDeckWithRelations> {
		const result = await prisma.designDeck.create({
			data: {
				...input,
				updatedBy: input.createdBy,
			},
			include: {
				designProject: true,
			},
		});
		return result as DesignDeckWithRelations;
	}

	/**
	 * Update deck
	 */
	static async update(id: string, input: UpdateDesignDeckInput & { updatedBy: string }): Promise<DesignDeckWithRelations> {
		const result = await prisma.designDeck.update({
			where: { id },
			data: input,
			include: {
				designProject: true,
			},
		});
		return result as DesignDeckWithRelations;
	}

	/**
	 * Delete deck
	 */
	static async delete(id: string): Promise<void> {
		await prisma.designDeck.delete({
			where: { id },
		});
	}
}
