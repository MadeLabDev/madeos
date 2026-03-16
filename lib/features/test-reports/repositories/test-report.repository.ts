import { prisma } from "@/lib/prisma";

import type { CreateTestReportInput, GetTestReportsOptions, ReportStatus, TestReportWithRelations, UpdateTestReportInput } from "../types/test-report.types";

const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * TestReport Repository
 * Direct database operations for test reports
 */

export class TestReportRepository {
	/**
	 * Get all test reports with filters and pagination
	 */
	static async getAllTestReports(options: GetTestReportsOptions = {}) {
		const { page = 1, pageSize = 10, testOrderId, status, search } = options;

		const skip = (page - 1) * pageSize;

		const where: any = {};

		if (testOrderId) {
			where.testOrderId = testOrderId;
		}

		if (status) {
			where.status = status;
		}

		if (search) {
			where.OR = [{ title: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { summary: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }];
		}

		const [testReports, total] = await Promise.all([
			prisma.testReport.findMany({
				where,
				skip,
				take: pageSize,
				include: {
					testOrder: {
						select: {
							id: true,
							title: true,
							status: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.testReport.count({ where }),
		]);

		return {
			testReports,
			total,
			page,
			pageSize,
		};
	}

	/**
	 * Get test report by ID
	 */
	static async getTestReportById(id: string): Promise<TestReportWithRelations | null> {
		return prisma.testReport.findUnique({
			where: { id },
			include: {
				testOrder: {
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
	 * Get test reports by test order
	 */
	static async getTestReportsByTestOrder(testOrderId: string): Promise<TestReportWithRelations[]> {
		return prisma.testReport.findMany({
			where: { testOrderId },
			include: {
				testOrder: {
					select: {
						id: true,
						title: true,
						status: true,
					},
				},
			},
			orderBy: { version: "desc" },
		});
	}

	/**
	 * Create a new test report
	 */
	static async createTestReport(data: CreateTestReportInput, userId?: string): Promise<TestReportWithRelations> {
		return prisma.testReport.create({
			data: {
				...data,
				createdBy: userId,
			},
			include: {
				testOrder: {
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
	 * Update an existing test report
	 */
	static async updateTestReport(id: string, data: UpdateTestReportInput, userId?: string): Promise<TestReportWithRelations> {
		return prisma.testReport.update({
			where: { id },
			data: {
				...data,
				updatedBy: userId,
			},
			include: {
				testOrder: {
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
	 * Delete a test report
	 */
	static async deleteTestReport(id: string): Promise<TestReportWithRelations> {
		return prisma.testReport.delete({
			where: { id },
			include: {
				testOrder: {
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
	 * Publish a test report
	 */
	static async publishTestReport(id: string, userId?: string): Promise<TestReportWithRelations> {
		return prisma.testReport.update({
			where: { id },
			data: {
				status: "PUBLISHED",
				publishedAt: new Date(),
				updatedBy: userId,
			},
			include: {
				testOrder: {
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
	 * Approve a test report
	 */
	static async approveTestReport(id: string, userId?: string): Promise<TestReportWithRelations> {
		return prisma.testReport.update({
			where: { id },
			data: {
				status: "APPROVED",
				approvedAt: new Date(),
				approvedBy: userId,
				updatedBy: userId,
			},
			include: {
				testOrder: {
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
	 * Get count of test reports by status
	 */
	static async getTestReportCountByStatus(): Promise<Record<ReportStatus, number>> {
		const counts = await prisma.testReport.groupBy({
			by: ["status"],
			_count: { id: true },
		});

		const result: Record<string, number> = {};
		counts.forEach((item: any) => {
			result[item.status] = item._count.id;
		});

		return result as Record<ReportStatus, number>;
	}
}
