/**
 * Post Tag Repository
 * Database operations for Post Tags
 */

import { prisma } from "@/lib/prisma";

import { CreatePostTagInput, PostTag, UpdatePostTagInput } from "../types";

export class PostTagRepository {
	/**
	 * Find all tags
	 */
	static async findMany(sortBy: "name" = "name"): Promise<PostTag[]> {
		return prisma.postTag.findMany({
			orderBy: { [sortBy]: "asc" },
		});
	}

	/**
	 * Find tag by ID
	 */
	static async findById(id: string): Promise<PostTag | null> {
		return prisma.postTag.findUnique({
			where: { id },
		});
	}

	/**
	 * Find tag by slug
	 */
	static async findBySlug(slug: string): Promise<PostTag | null> {
		return prisma.postTag.findFirst({
			where: { slug },
		});
	}

	/**
	 * Find tag by name
	 */
	static async findByName(name: string): Promise<PostTag | null> {
		return prisma.postTag.findFirst({
			where: { name },
		});
	}

	/**
	 * Create new tag
	 */
	static async create(input: CreatePostTagInput): Promise<PostTag> {
		return prisma.postTag.create({
			data: input,
		});
	}

	/**
	 * Update tag
	 */
	static async update(id: string, input: UpdatePostTagInput): Promise<PostTag> {
		return prisma.postTag.update({
			where: { id },
			data: input,
		});
	}

	/**
	 * Delete tag
	 */
	static async delete(id: string): Promise<void> {
		await prisma.postTag.delete({
			where: { id },
		});
	}
}
