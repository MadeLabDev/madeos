/**
 * SOPLibrary Repository
 * Database operations for SOPLibraries
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateSOPLibraryInput, SOPLibraryFilters, SOPLibraryWithRelations, UpdateSOPLibraryInput } from "../types";

export class SOPLibraryRepository {
	/**
	 * Find SOP library by ID with relations
	 */
	static async findById(id: string): Promise<SOPLibraryWithRelations | null> {
		return prisma.sOPLibrary.findUnique({
			where: { id },
		});
	}

	/**
	 * Find SOP library by slug
	 */
	static async findBySlug(slug: string): Promise<SOPLibraryWithRelations | null> {
		return prisma.sOPLibrary.findUnique({
			where: { slug },
		});
	}

	/**
	 * Find multiple SOP libraries with pagination and filters
	 */
	static async findMany(filters: SOPLibraryFilters = {}, options: { skip?: number; take?: number } = {}): Promise<SOPLibraryWithRelations[]> {
		const where: any = {};

		if (filters.category) where.category = filters.category;
		if (filters.status) where.status = filters.status;

		if (filters.effectiveDateFrom || filters.effectiveDateTo) {
			where.effectiveDate = {};
			if (filters.effectiveDateFrom) where.effectiveDate.gte = filters.effectiveDateFrom;
			if (filters.effectiveDateTo) where.effectiveDate.lte = filters.effectiveDateTo;
		}

		if (filters.sunsetDateFrom || filters.sunsetDateTo) {
			where.sunsetDate = {};
			if (filters.sunsetDateFrom) where.sunsetDate.gte = filters.sunsetDateFrom;
			if (filters.sunsetDateTo) where.sunsetDate.lte = filters.sunsetDateTo;
		}

		if (filters.lastReviewedAtFrom || filters.lastReviewedAtTo) {
			where.lastReviewedAt = {};
			if (filters.lastReviewedAtFrom) where.lastReviewedAt.gte = filters.lastReviewedAtFrom;
			if (filters.lastReviewedAtTo) where.lastReviewedAt.lte = filters.lastReviewedAtTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { content: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { category: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.sOPLibrary.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count SOP libraries with filters
	 */
	static async count(filters: SOPLibraryFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.category) where.category = filters.category;
		if (filters.status) where.status = filters.status;

		if (filters.effectiveDateFrom || filters.effectiveDateTo) {
			where.effectiveDate = {};
			if (filters.effectiveDateFrom) where.effectiveDate.gte = filters.effectiveDateFrom;
			if (filters.effectiveDateTo) where.effectiveDate.lte = filters.effectiveDateTo;
		}

		if (filters.sunsetDateFrom || filters.sunsetDateTo) {
			where.sunsetDate = {};
			if (filters.sunsetDateFrom) where.sunsetDate.gte = filters.sunsetDateFrom;
			if (filters.sunsetDateTo) where.sunsetDate.lte = filters.sunsetDateTo;
		}

		if (filters.lastReviewedAtFrom || filters.lastReviewedAtTo) {
			where.lastReviewedAt = {};
			if (filters.lastReviewedAtFrom) where.lastReviewedAt.gte = filters.lastReviewedAtFrom;
			if (filters.lastReviewedAtTo) where.lastReviewedAt.lte = filters.lastReviewedAtTo;
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { content: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { category: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.sOPLibrary.count({ where });
	}

	/**
	 * Create new SOP library
	 */
	static async create(data: CreateSOPLibraryInput & { createdBy: string; updatedBy: string }): Promise<SOPLibraryWithRelations> {
		return prisma.sOPLibrary.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
		});
	}

	/**
	 * Update SOP library
	 */
	static async update(id: string, data: UpdateSOPLibraryInput & { updatedBy: string }): Promise<SOPLibraryWithRelations> {
		return prisma.sOPLibrary.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
		});
	}

	/**
	 * Delete SOP library
	 */
	static async delete(id: string): Promise<void> {
		await prisma.sOPLibrary.delete({
			where: { id },
		});
	}
}
