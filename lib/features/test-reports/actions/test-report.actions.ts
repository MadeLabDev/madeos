"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { TestReportService } from "../services/test-report.service";
import type { CreateTestReportInput, GetTestReportsOptions, UpdateTestReportInput } from "../types/test-report.types";

/**
 * Get all test reports with filters and pagination
 */
export async function listTestReportsAction(options: GetTestReportsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const result = await TestReportService.getAllTestReports(options);
		return { success: true, message: "Test reports retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single test report by ID
 */
export async function getTestReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testReport = await TestReportService.getTestReportById(id);

		if (!testReport) {
			return { success: false, message: "Test report not found" };
		}

		return { success: true, message: "Test report retrieved", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get test reports by test order
 */
export async function getTestReportsByTestOrderAction(testOrderId: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testReports = await TestReportService.getTestReportsByTestOrder(testOrderId);
		return { success: true, message: "Test reports retrieved", data: testReports };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new test report
 */
export async function createTestReportAction(data: CreateTestReportInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const testReport = await TestReportService.createTestReport(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_report_update", {
			action: "report_created",
			testReport,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-reports");
		revalidatePath(`/testing-development/test-orders/${data.testOrderId}`);

		return { success: true, message: "Test report created", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing test report
 */
export async function updateTestReportAction(id: string, data: UpdateTestReportInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const testReport = await TestReportService.updateTestReport(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_report_update", {
			action: "report_updated",
			testReport,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-reports");
		revalidatePath(`/testing-development/test-reports/${id}`);
		if (testReport.testOrderId) {
			revalidatePath(`/testing-development/test-orders/${testReport.testOrderId}`);
		}

		return { success: true, message: "Test report updated", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a test report
 */
export async function deleteTestReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "delete");

		const testReport = await TestReportService.deleteTestReport(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_report_update", {
			action: "report_deleted",
			testReportId: id,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-reports");
		if (testReport.testOrderId) {
			revalidatePath(`/testing-development/test-orders/${testReport.testOrderId}`);
		}

		return { success: true, message: "Test report deleted", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Publish a test report
 */
export async function publishTestReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const testReport = await TestReportService.publishTestReport(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_report_update", {
			action: "report_published",
			testReport,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-reports");
		revalidatePath(`/testing-development/test-reports/${id}`);

		return { success: true, message: "Test report published", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Approve a test report
 */
export async function approveTestReportAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const testReport = await TestReportService.approveTestReport(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_report_update", {
			action: "report_approved",
			testReport,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-reports");
		revalidatePath(`/testing-development/test-reports/${id}`);

		return { success: true, message: "Test report approved", data: testReport };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get test report statistics
 */
export async function getTestReportStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const statistics = await TestReportService.getTestReportStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
