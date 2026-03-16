/**
 * Sample Repository
 * Database operations for Samples
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateSampleInput, SampleFilters, SampleWithRelations, UpdateSampleInput } from "../types";

export class SampleRepository {
	/**
	 * Find sample by ID with relations
	 */
	static async findById(id: string): Promise<SampleWithRelations | null> {
		return prisma.sample.findUnique({
			where: { id },
			include: {
				testOrder: true,
				tests: true,
			},
		});
	}

	/**
	 * Find multiple samples with pagination and filters
	 */
	static async findMany(filters: SampleFilters = {}, options: { skip?: number; take?: number } = {}): Promise<SampleWithRelations[]> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.status) where.status = filters.status;
		if (filters.type) where.type = filters.type;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.sample.findMany({
			where,
			include: {
				testOrder: true,
				tests: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count samples with filters
	 */
	static async count(filters: SampleFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.status) where.status = filters.status;
		if (filters.type) where.type = filters.type;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.sample.count({ where });
	}

	/**
	 * Create new sample
	 */
	static async create(data: CreateSampleInput & { createdBy: string; updatedBy: string }): Promise<SampleWithRelations> {
		return prisma.sample.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				testOrder: true,
				tests: true,
			},
		});
	}

	/**
	 * Update sample
	 */
	static async update(id: string, data: UpdateSampleInput & { updatedBy: string }): Promise<SampleWithRelations> {
		return prisma.sample.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				testOrder: true,
				tests: true,
			},
		});
	}

	/**
	 * Delete sample
	 */
	static async delete(id: string): Promise<void> {
		await prisma.sample.delete({
			where: { id },
		});
	}
}
