/**
 * TestSuite Repository
 * Database operations for TestSuites
 */

import { prisma } from "@/lib/prisma";

import { CreateTestSuiteInput, TestSuiteFilters, TestSuiteWithRelations, UpdateTestSuiteInput } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class TestSuiteRepository {
	/**
	 * Find test suite by ID with relations
	 */
	static async findById(id: string): Promise<TestSuiteWithRelations | null> {
		return prisma.testSuite.findUnique({
			where: { id },
			include: {
				orders: {
					include: {
						testOrder: true,
					},
				},
				tests: true,
			},
		});
	}

	/**
	 * Find multiple test suites with pagination and filters
	 */
	static async findMany(filters: TestSuiteFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestSuiteWithRelations[]> {
		const where: any = {};

		if (filters.category) where.category = filters.category;
		if (filters.isActive !== undefined) where.isActive = filters.isActive;

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testSuite.findMany({
			where,
			include: {
				orders: {
					include: {
						testOrder: true,
					},
				},
				tests: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count test suites with filters
	 */
	static async count(filters: TestSuiteFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.category) where.category = filters.category;
		if (filters.isActive !== undefined) where.isActive = filters.isActive;

		if (filters.search) {
			where.OR = [{ name: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testSuite.count({ where });
	}

	/**
	 * Create new test suite
	 */
	static async create(data: CreateTestSuiteInput & { createdBy: string; updatedBy: string }): Promise<TestSuiteWithRelations> {
		return prisma.testSuite.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				orders: {
					include: {
						testOrder: true,
					},
				},
				tests: true,
			},
		});
	}

	/**
	 * Update test suite
	 */
	static async update(id: string, data: UpdateTestSuiteInput & { updatedBy: string }): Promise<TestSuiteWithRelations> {
		return prisma.testSuite.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				orders: {
					include: {
						testOrder: true,
					},
				},
				tests: true,
			},
		});
	}

	/**
	 * Delete test suite
	 */
	static async delete(id: string): Promise<void> {
		await prisma.testSuite.delete({
			where: { id },
		});
	}

	/**
	 * Assign test suite to test order
	 */
	static async assignToOrder(testOrderId: string, testSuiteId: string, assignedBy: string): Promise<void> {
		await prisma.testSuiteOnOrder.create({
			data: {
				testOrderId,
				testSuiteId,
				assignedBy,
			},
		});
	}

	/**
	 * Remove test suite from test order
	 */
	static async removeFromOrder(testOrderId: string, testSuiteId: string): Promise<void> {
		await prisma.testSuiteOnOrder.deleteMany({
			where: {
				testOrderId,
				testSuiteId,
			},
		});
	}
}
