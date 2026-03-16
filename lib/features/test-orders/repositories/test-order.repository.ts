import type { CreateTestOrderInput, GetTestOrdersOptions, TestOrderStatus, TestOrderWithRelations, UpdateTestOrderInput } from "@/lib/features/test-orders/types/test-order.types";
import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * TestOrder Repository
 * Direct database operations for test orders
 */

export class TestOrderRepository {
	/**
	 * Get all test orders with filters and pagination
	 */
	static async getAllTestOrders(options: GetTestOrdersOptions = {}) {
		const { page = 1, pageSize = 10, engagementId, status, assignedTo, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (engagementId) {
			where.engagementId = engagementId;
		}

		if (status) {
			where.status = status;
		}

		if (assignedTo) {
			where.assignedTo = assignedTo;
		}

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [testOrders, total] = await Promise.all([
			prisma.testOrder.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					engagement: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
					contact: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					_count: {
						select: {
							samples: true,
							testSuites: true,
							tests: true,
							reports: true,
							interactions: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.testOrder.count({ where }),
		]);

		return {
			testOrders,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get test order by ID
	 */
	static async getTestOrderById(id: string): Promise<TestOrderWithRelations | null> {
		return prisma.testOrder.findUnique({
			where: { id },
			include: {
				engagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				contact: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				samples: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				testSuites: {
					select: {
						id: true,
						testSuiteId: true,
					},
				},
				tests: {
					select: {
						id: true,
						name: true,
						status: true,
					},
				},
				reports: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				_count: {
					select: {
						samples: true,
						testSuites: true,
						tests: true,
						reports: true,
						interactions: true,
					},
				},
			},
		});
	}

	/**
	 * Get test orders by engagement
	 */
	static async getTestOrdersByEngagement(engagementId: string): Promise<TestOrderWithRelations[]> {
		return prisma.testOrder.findMany({
			where: { engagementId },
			include: {
				contact: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				_count: {
					select: {
						samples: true,
						testSuites: true,
						tests: true,
						reports: true,
						interactions: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Create a new test order
	 */
	static async createTestOrder(data: CreateTestOrderInput, userId?: string): Promise<TestOrderWithRelations> {
		return prisma.testOrder.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				engagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				contact: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				_count: {
					select: {
						samples: true,
						testSuites: true,
						tests: true,
						reports: true,
						interactions: true,
					},
				},
			},
		});
	}

	/**
	 * Update an existing test order
	 */
	static async updateTestOrder(id: string, data: UpdateTestOrderInput, userId?: string): Promise<TestOrderWithRelations> {
		return prisma.testOrder.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				engagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
				contact: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				_count: {
					select: {
						samples: true,
						testSuites: true,
						tests: true,
						reports: true,
						interactions: true,
					},
				},
			},
		});
	}

	/**
	 * Delete a test order
	 */
	static async deleteTestOrder(id: string): Promise<TestOrderWithRelations> {
		return prisma.testOrder.delete({
			where: { id },
			include: {
				engagement: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
		});
	}

	/**
	 * Get count of test orders by status
	 */
	static async getTestOrderCountByStatus(): Promise<Record<TestOrderStatus, number>> {
		const counts = await prisma.testOrder.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<TestOrderStatus, number>;
	}
}
