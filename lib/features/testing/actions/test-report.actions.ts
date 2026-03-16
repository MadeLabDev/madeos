/**
 * TestReport Actions
 * Server actions for TestReports
 */

"use server";

import { revalidatePath } from "next/cache";

import { TestReportService } from "@/lib/features/testing/services";
import { CreateTestReportInput, UpdateTestReportInput } from "@/lib/features/testing/types";
import { requirePermission } from "@/lib/permissions";

/**
 * Get test reports for selection (no permission required for basic listing)
 */
export async function getTestReports(filters: Parameters<typeof TestReportService.getTestReports>[0] = {}, options: Parameters<typeof TestReportService.getTestReports>[1] = {}) {
	try {
		const testReports = await TestReportService.getTestReports(filters, options);

		return {
			success: true,
			data: testReports,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test reports: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get test reports list with filters for admin interface
 */
export async function getTestReportsList(filters: Parameters<typeof TestReportService.getTestReports>[0] = {}, options: Parameters<typeof TestReportService.getTestReports>[1] = {}) {
	try {
		const testReports = await TestReportService.getTestReports(filters, options);

		return {
			success: true,
			data: testReports,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test reports: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single test report by ID
 */
export async function getTestReportById(id: string) {
	try {
		const testReport = await TestReportService.getTestReportById(id);

		return {
			success: true,
			data: testReport,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test report: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get test reports by sample ID
 * NOTE: This function is not implemented as TestReport does not have direct relation to Sample
 */
/*
export async function getTestReportsBySampleId(sampleId: string) {
	try {
		const testReports = await TestReportService.getTestReports({ sampleId }, { include: { sample: true, test: true, testOrder: true } });

		return {
			success: true,
			data: testReports,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test reports for sample: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
*/

/**
 * Get test reports by test ID
 * NOTE: This function is not implemented as TestReport does not have direct relation to Test
 */
/*
export async function getTestReportsByTestId(testId: string) {
	try {
		const testReports = await TestReportService.getTestReports({ testId }, { include: { test: true, testOrder: true } });

		return {
			success: true,
			data: testReports,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test reports for test: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
*/

/**
 * Create new test report
 */
export async function createTestReport(data: CreateTestReportInput) {
	try {
		const user = await requirePermission("testing", "create");

		const result = await TestReportService.createTestReport({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create test report: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update test report
 */
export async function updateTestReport(id: string, data: UpdateTestReportInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await TestReportService.updateTestReport(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			revalidatePath(`/testing/test-reports/${id}`);
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update test report: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete test report
 */
export async function deleteTestReport(id: string) {
	try {
		await requirePermission("testing", "delete");

		const result = await TestReportService.deleteTestReport(id);

		if (result.success) {
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete test report: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
