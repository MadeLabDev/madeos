import { prisma } from "@/lib/prisma";

import type { CreateTestSuiteInput, GetTestSuitesOptions, TestSuiteWithRelations, UpdateTestSuiteInput } from "../types/test-suite.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * TestSuite Repository
 * Direct database operations for test suites
 */

export class TestSuiteRepository {
	/**
	 * Get all test suites with filters and pagination
	 */
	static async getAllTestSuites(options: GetTestSuitesOptions = {}) {
		const { page = 1, pageSize = 10, category, isActive, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (category) {
			where.category = category;
		}

		if (isActive !== undefined) {
			where.isActive = isActive;
		}

		if (search) {
			where.OR = [{ name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [testSuites, total] = await Promise.all([
			prisma.testSuite.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					_count: {
						select: {
							tests: true,
							orders: true,
						},
					},
				},
				orderBy: { name: "asc" },
			}),
			prisma.testSuite.count({ where }),
		]);

		return {
			testSuites,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get test suite by ID
	 */
	static async getTestSuiteById(id: string): Promise<TestSuiteWithRelations | null> {
		return prisma.testSuite.findUnique({
			where: { id },
			include: {
				tests: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				orders: {
					select: {
						id: true,
						testOrderId: true,
					},
				},
				_count: {
					select: {
						tests: true,
						orders: true,
					},
				},
			},
		});
	}

	/**
	 * Create a new test suite
	 */
	static async createTestSuite(data: CreateTestSuiteInput, userId?: string): Promise<TestSuiteWithRelations> {
		return prisma.testSuite.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				_count: {
					select: {
						tests: true,
						orders: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing test suite
	 */
	static async updateTestSuite(id: string, data: UpdateTestSuiteInput, userId?: string): Promise<TestSuiteWithRelations> {
		return prisma.testSuite.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				_count: {
					select: {
						tests: true,
						orders: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a test suite
	 */
	static async deleteTestSuite(id: string): Promise<TestSuiteWithRelations> {
		return prisma.testSuite.delete({
			where: { id },
			include: {
				_count: {
					select: {
						tests: true,
						orders: true,
					},
				},
			},
		});
	}

	/**
	 * Get test suites by category
	 */
	static async getTestSuitesByCategory(category: string): Promise<TestSuiteWithRelations[]> {
		return prisma.testSuite.findMany({
			where: { category, isActive: true },
			include: {
				_count: {
					select: {
						tests: true,
						orders: true,
					},
				},
			},
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Get all categories
	 */
	static async getCategories(): Promise<string[]> {
		const result = await prisma.testSuite.findMany({
			where: { category: { not: null } },
			select: { category: true },
			distinct: ["category"],
		});

		return result.map((r) => r.category).filter((c): c is string => c !== null);
	}
}
