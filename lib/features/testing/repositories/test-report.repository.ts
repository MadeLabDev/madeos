/**
 * TestReport Repository
 * Database operations for TestReports
 */

import { prisma } from "@/lib/prisma";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

import { CreateTestReportInput, TestReportFilters, TestReportWithRelations, UpdateTestReportInput } from "../types";

export class TestReportRepository {
	/**
	 * Find test report by ID with relations
	 */
	static async findById(id: string): Promise<TestReportWithRelations | null> {
		return prisma.testReport.findUnique({
			where: { id },
			include: {
				testOrder: true,
			},
		});
	}

	/**
	 * Find multiple test reports with pagination and filters
	 */
	static async findMany(filters: TestReportFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestReportWithRelations[]> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.status) where.status = filters.status;
		if (filters.approvedBy) where.approvedBy = filters.approvedBy;

		if (filters.publishedAt) {
			where.publishedAt = {
				lte: filters.publishedAt,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { summary: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testReport.findMany({
			where,
			include: {
				testOrder: true,
			},
			orderBy: { createdAt: "desc" },
			skip: options.skip,
			take: options.take,
		});
	}

	/**
	 * Count test reports with filters
	 */
	static async count(filters: TestReportFilters = {}): Promise<number> {
		const where: any = {};

		if (filters.testOrderId) where.testOrderId = filters.testOrderId;
		if (filters.status) where.status = filters.status;
		if (filters.approvedBy) where.approvedBy = filters.approvedBy;

		if (filters.publishedAt) {
			where.publishedAt = {
				lte: filters.publishedAt,
			};
		}

		if (filters.createdAfter || filters.createdBefore) {
			where.createdAt = {};
			if (filters.createdAfter) where.createdAt.gte = filters.createdAfter;
			if (filters.createdBefore) where.createdAt.lte = filters.createdBefore;
		}

		if (filters.search) {
			where.OR = [{ title: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { summary: { contains: filters.search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		return prisma.testReport.count({ where });
	}

	/**
	 * Create new test report
	 */
	static async create(data: CreateTestReportInput & { createdBy: string; updatedBy: string }): Promise<TestReportWithRelations> {
		return prisma.testReport.create({
			data: {
				...data,
				createdBy: data.createdBy,
				updatedBy: data.updatedBy,
			},
			include: {
				testOrder: true,
			},
		});
	}

	/**
	 * Update test report
	 */
	static async update(id: string, data: UpdateTestReportInput & { updatedBy: string }): Promise<TestReportWithRelations> {
		return prisma.testReport.update({
			where: { id },
			data: {
				...data,
				updatedBy: data.updatedBy,
			},
			include: {
				testOrder: true,
			},
		});
	}

	/**
	 * Delete test report
	 */
	static async delete(id: string): Promise<void> {
		await prisma.testReport.delete({
			where: { id },
		});
	}
}
