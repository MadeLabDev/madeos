/**
 * Knowledge Category Repository
 * Database operations for Knowledge Categories
 */

import { prisma } from "@/lib/prisma";

import { CreateCategoryInput, KnowledgeCategory, UpdateCategoryInput } from "../types";

export class KnowledgeCategoryRepository {
	/**
	 * Find all categories
	 */
	static async findMany(sortBy: "order" | "name" = "order"): Promise<KnowledgeCategory[]> {
		return prisma.knowledgeCategory.findMany({
			orderBy: { [sortBy]: "asc" },
		});
	}

	/**
	 * Find category by ID
	 */
	static async findById(id: string): Promise<KnowledgeCategory | null> {
		return prisma.knowledgeCategory.findUnique({
			where: { id },
		});
	}

	/**
	 * Find category by slug
	 */
	static async findBySlug(slug: string): Promise<KnowledgeCategory | null> {
		return prisma.knowledgeCategory.findUnique({
			where: { slug },
		});
	}

	/**
	 * Find category by name
	 */
	static async findByName(name: string): Promise<KnowledgeCategory | null> {
		return prisma.knowledgeCategory.findFirst({
			where: { name },
		});
	}

	/**
	 * Create new category
	 */
	static async create(input: CreateCategoryInput): Promise<KnowledgeCategory> {
		return prisma.knowledgeCategory.create({
			data: input,
		});
	}

	/**
	 * Update category
	 */
	static async update(id: string, input: UpdateCategoryInput): Promise<KnowledgeCategory> {
		return prisma.knowledgeCategory.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete category
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await prisma.knowledgeCategory.delete({
				where: { id },
			});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Check if slug exists
	 */
	static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
		const where: any = { slug };
		if (excludeId) {
			where.id = { not: excludeId };
		}

		const count = await prisma.knowledgeCategory.count({ where });
		return count > 0;
	}
}
