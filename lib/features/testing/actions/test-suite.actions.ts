/**
 * TestSuite Actions
 * Server actions for TestSuites
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { TestSuiteService } from "../services";
import { AssignTestSuiteInput, CreateTestSuiteInput, UpdateTestSuiteInput } from "../types";

/**
 * Get test suites for selection (no permission required for basic listing)
 */
export async function getTestSuites(filters: Parameters<typeof TestSuiteService.getTestSuites>[0] = {}, options: Parameters<typeof TestSuiteService.getTestSuites>[1] = {}) {
	try {
		const testSuites = await TestSuiteService.getTestSuites(filters, options);

		return {
			success: true,
			data: testSuites,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test suites: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get test suites list with filters for admin interface
 */
export async function getTestSuitesList(filters: Parameters<typeof TestSuiteService.getTestSuites>[0] = {}, options: Parameters<typeof TestSuiteService.getTestSuites>[1] = {}) {
	try {
		const testSuites = await TestSuiteService.getTestSuites(filters, options);

		return {
			success: true,
			data: testSuites,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test suites: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single test suite by ID
 */
export async function getTestSuiteById(id: string) {
	try {
		const testSuite = await TestSuiteService.getTestSuiteById(id);

		return {
			success: true,
			data: testSuite,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test suite: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new test suite
 */
export async function createTestSuite(data: CreateTestSuiteInput) {
	try {
		const user = await requirePermission("testing", "create");

		const result = await TestSuiteService.createTestSuite({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			await broadcastToAll("test_suite_update", {
				action: "test_suite_created",
				testSuite: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create test suite: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update test suite
 */
export async function updateTestSuite(id: string, data: UpdateTestSuiteInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await TestSuiteService.updateTestSuite(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			revalidatePath(`/testing/test-suites/${id}`);
			await broadcastToAll("test_suite_update", {
				action: "test_suite_updated",
				testSuite: result.data,
				testSuiteId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update test suite: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete test suite
 */
export async function deleteTestSuite(id: string) {
	try {
		await requirePermission("testing", "delete");

		const result = await TestSuiteService.deleteTestSuite(id);

		if (result.success) {
			revalidatePath("/test-management");
			await broadcastToAll("test_suite_update", {
				action: "test_suite_deleted",
				testSuiteId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete test suite: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Assign test suite to test order
 */
export async function assignTestSuiteToOrder(data: AssignTestSuiteInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await TestSuiteService.assignTestSuiteToOrder({
			...data,
			assignedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to assign test suite to order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Remove test suite from test order
 */
export async function removeTestSuiteFromOrder(testOrderId: string, testSuiteId: string) {
	try {
		await requirePermission("testing", "update");

		const result = await TestSuiteService.removeTestSuiteFromOrder(testOrderId, testSuiteId);

		if (result.success) {
			revalidatePath("/test-management");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to remove test suite from order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
