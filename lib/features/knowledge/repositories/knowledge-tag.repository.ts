/**
 * Knowledge Tag Repository
 * Database operations for Knowledge Tags
 */

import { prisma } from "@/lib/prisma";

import { CreateTagInput, KnowledgeTag, UpdateTagInput } from "../types";

export class KnowledgeTagRepository {
	/**
	 * Find all tags
	 */
	static async findMany(sortBy: "name" | "createdAt" = "name"): Promise<KnowledgeTag[]> {
		return prisma.knowledgeTag.findMany({
			orderBy: { [sortBy]: "asc" },
		});
	}

	/**
	 * Find tag by ID
	 */
	static async findById(id: string): Promise<KnowledgeTag | null> {
		return prisma.knowledgeTag.findUnique({
			where: { id },
		});
	}

	/**
	 * Find tag by slug
	 */
	static async findBySlug(slug: string): Promise<KnowledgeTag | null> {
		return prisma.knowledgeTag.findUnique({
			where: { slug },
		});
	}

	/**
	 * Find tag by name
	 */
	static async findByName(name: string): Promise<KnowledgeTag | null> {
		return prisma.knowledgeTag.findFirst({
			where: { name },
		});
	}

	/**
	 * Find multiple tags by IDs
	 */
	static async findByIds(ids: string[]): Promise<KnowledgeTag[]> {
		return prisma.knowledgeTag.findMany({
			where: {
				id: { in: ids },
			},
		});
	}

	/**
	 * Create new tag
	 */
	static async create(input: CreateTagInput): Promise<KnowledgeTag> {
		return prisma.knowledgeTag.create({
			data: input,
		});
	}

	/**
	 * Update tag
	 */
	static async update(id: string, input: UpdateTagInput): Promise<KnowledgeTag> {
		return prisma.knowledgeTag.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete tag
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			await prisma.knowledgeTag.delete({
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

		const count = await prisma.knowledgeTag.count({ where });
		return count > 0;
	}
}
