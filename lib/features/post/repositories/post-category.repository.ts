/**
 * Post Category Repository
 * Database operations for Post Categories
 */

import { prisma } from "@/lib/prisma";

import { CreatePostCategoryInput, PostCategory, UpdatePostCategoryInput } from "../types";

export class PostCategoryRepository {
	/**
	 * Find all categories
	 */
	static async findMany(sortBy: "order" | "name" = "order"): Promise<PostCategory[]> {
		return prisma.postCategory.findMany({
			orderBy: { [sortBy]: "asc" },
		});
	}

	/**
	 * Find category by ID
	 */
	static async findById(id: string): Promise<PostCategory | null> {
		return prisma.postCategory.findUnique({
			where: { id },
		});
	}

	/**
	 * Find category by slug
	 */
	static async findBySlug(slug: string): Promise<PostCategory | null> {
		return prisma.postCategory.findFirst({
			where: { slug },
		});
	}

	/**
	 * Find category by name
	 */
	static async findByName(name: string): Promise<PostCategory | null> {
		return prisma.postCategory.findFirst({
			where: { name },
		});
	}

	/**
	 * Create new category
	 */
	static async create(input: CreatePostCategoryInput): Promise<PostCategory> {
		return prisma.postCategory.create({
			data: input,
		});
	}

	/**
	 * Update category
	 */
	static async update(id: string, input: UpdatePostCategoryInput): Promise<PostCategory> {
		return prisma.postCategory.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete category
	 */
	static async delete(id: string): Promise<void> {
		await prisma.postCategory.delete({
			where: { id },
		});
	}
}
