/**
 * Test Repository
 * Database operations for Tests
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateTestInput, TestFilters, TestWithRelations, UpdateTestInput } from "../types";

export class TestRepository {
	/**
	 * Find test by ID with relations
	 */
	static async findById(id: string): Promise<TestWithRelations | null> {
		return prisma.test.findUnique({
			where: { id },
			include: {
				testOrder: true,
				testSuite: true,
				sample: true,
			},
		});
	}

	/**
	 * Find multiple tests with pagination and filters
	 */
	static async findMany(filters: TestFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestWithRelations[]> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.testSuiteId) where.testSuiteId = filters.testSuiteId;
		if (filters.sampleId) where.sampleId = filters.sampleId;
		if (filters.status) where.status = filters.status;
		if (filters.performedBy) where.performedBy = filters.performedBy;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.test.findMany({
			where,
			include: {
				testOrder: true,
				testSuite: true,
				sample: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count tests with filters
	 */
	static async count(filters: TestFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.testSuiteId) where.testSuiteId = filters.testSuiteId;
		if (filters.sampleId) where.sampleId = filters.sampleId;
		if (filters.status) where.status = filters.status;
		if (filters.performedBy) where.performedBy = filters.performedBy;

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.test.count({ where });
	}

	/**
	 * Create new test
	 */
	static async create(data: CreateTestInput & { createdBy: string; updatedBy: string }): Promise<TestWithRelations> {
		// Prepare data, ensuring undefined values are properly handled
		const createData: any = {
			name: data.name,
			createdBy: data.createdBy,
			updatedBy: data.updatedBy,
		};

		// Only include optional fields if they have values
		if (data.testOrderId) createData.testOrderId = data.testOrderId;
		if (data.testSuiteId) createData.testSuiteId = data.testSuiteId;
		if (data.sampleId) createData.sampleId = data.sampleId;
		if (data.description) createData.description = data.description;
		if (data.method) createData.method = data.method;
		if (data.parameters) createData.parameters = data.parameters;
		if (data.expectedResult) createData.expectedResult = data.expectedResult;
		if (data.notes) createData.notes = data.notes;
		if (data.mediaIds) createData.mediaIds = data.mediaIds;
		if (data.metaData) createData.metaData = data.metaData;

		return prisma.test.create({
			data: createData,
			include: {
				testOrder: true,
				testSuite: true,
				sample: true,
			},
		});
	}

	/**
	 * Update test
	 */
	static async update(id: string, data: UpdateTestInput & { updatedBy: string }): Promise<TestWithRelations> {
		return prisma.test.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				testOrder: true,
				testSuite: true,
				sample: true,
			},
		});
	}

	/**
	 * Delete test
	 */
	static async delete(id: string): Promise<void> {
		await prisma.test.delete({
			where: { id },
		});
	}
}
