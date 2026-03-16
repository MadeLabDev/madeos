/**
 * TestOrder Repository
 * Database operations for TestOrders
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateTestOrderInput, TestOrderFilters, TestOrderWithRelations, UpdateTestOrderInput } from "../types";

export class TestOrderRepository {
	/**
	 * Find test order by ID with relations
	 */
	static async findById(id: string): Promise<TestOrderWithRelations | null> {
		return prisma.testOrder.findUnique({
			where: { id },
			include: {
				engagement: true,
				contact: true,
				samples: true,
				testSuites: {
					include: {
						testSuite: true,
					},
				},
				tests: true,
				reports: true,
				interactions: true,
			},
		});
	}

	/**
	 * Find multiple test orders with pagination and filters
	 */
	static async findMany(filters: TestOrderFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestOrderWithRelations[]> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;
		if (filters.requestedBy) where.requestedBy = filters.requestedBy;
		if (filters.contactId) where.contactId = filters.contactId;

		if (filters.dueDate) {
			where.dueDate = {
				lte: filters.dueDate,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testOrder.findMany({
			where,
			include: {
				engagement: true,
				contact: true,
				samples: true,
				testSuites: {
					include: {
						testSuite: true,
					},
				},
				tests: true,
				reports: true,
				interactions: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count test orders with filters
	 */
	static async count(filters: TestOrderFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.engagementId) where.engagementId = filters.engagementId;
		if (filters.status) where.status = filters.status;
		if (filters.assignedTo) where.assignedTo = filters.assignedTo;
		if (filters.requestedBy) where.requestedBy = filters.requestedBy;
		if (filters.contactId) where.contactId = filters.contactId;

		if (filters.dueDate) {
			where.dueDate = {
				lte: filters.dueDate,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { description: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testOrder.count({ where });
	}

	/**
	 * Create new test order
	 */
	static async create(data: CreateTestOrderInput & { createdBy: string; updatedBy: string }): Promise<TestOrderWithRelations> {
		return prisma.testOrder.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				engagement: true,
				contact: true,
				samples: true,
				testSuites: {
					include: {
						testSuite: true,
					},
				},
				tests: true,
				reports: true,
				interactions: true,
			},
		});
	}

	/**
	 * Update test order
	 */
	static async update(id: string, data: UpdateTestOrderInput & { updatedBy: string }): Promise<TestOrderWithRelations> {
		const { contactId, ...rest } = data;
		return prisma.testOrder.update({
			where: { id },
			data: {
				...rest,
				contactId: contactId ?? undefined,
				updatedBy: data.updatedBy,
			} as any,
			include: {
				engagement: true,
				contact: true,
				samples: true,
				testSuites: {
					include: {
						testSuite: true,
					},
				},
				tests: true,
				reports: true,
				interactions: true,
			},
		});
	}

	/**
	 * Delete test order
	 */
	static async delete(id: string): Promise<void> {
		await prisma.testOrder.delete({
			where: { id },
		});
	}
}
