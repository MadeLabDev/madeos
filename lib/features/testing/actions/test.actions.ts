/**
 * Test Actions
 * Server actions for Tests
 */

"use server";

import { revalidatePath } from "next/cache";

import { TestService } from "@/lib/features/testing/services";
import { CreateTestInput, UpdateTestInput } from "@/lib/features/testing/types";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

/**
 * Get tests for selection (no permission required for basic listing)
 */
export async function getTests(filters: Parameters<typeof TestService.getTests>[0] = {}, options: Parameters<typeof TestService.getTests>[1] = {}) {
	try {
		const tests = await TestService.getTests(filters, options);

		return {
			success: true,
			data: tests,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch tests: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get tests list with filters for admin interface
 */
export async function getTestsList(filters: Parameters<typeof TestService.getTests>[0] = {}, options: Parameters<typeof TestService.getTests>[1] = {}) {
	try {
		const tests = await TestService.getTests(filters, options);

		return {
			success: true,
			data: tests,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch tests: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single test by ID
 */
export async function getTestById(id: string) {
	try {
		const test = await TestService.getTestById(id);

		return {
			success: true,
			data: test,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get tests by sample ID
 */
export async function getTestsBySampleId(sampleId: string) {
	try {
		const tests = await TestService.getTests({ sampleId });

		return {
			success: true,
			data: tests,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch tests by sample ID",
		};
	}
}

/**
 * Create new test
 */
export async function createTest(data: CreateTestInput) {
	try {
		const user = await requirePermission("testing", "create");

		const result = await TestService.createTest({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			await broadcastToAll("test_update", {
				action: "test_created",
				test: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create test: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update test
 */
export async function updateTest(id: string, data: UpdateTestInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await TestService.updateTest(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			revalidatePath(`/testing/tests/${id}`);
			await broadcastToAll("test_update", {
				action: "test_updated",
				test: result.data,
				testId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update test: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete test
 */
export async function deleteTest(id: string) {
	try {
		await requirePermission("testing", "delete");

		const result = await TestService.deleteTest(id);

		if (result.success) {
			revalidatePath("/test-management");
			await broadcastToAll("test_update", {
				action: "test_deleted",
				testId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete test: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
export async function bulkCreateTests(data: { testOrderId: string; sampleId?: string; testSuiteIds: string[]; name: string; description?: string; method?: string; expectedResult?: string; actualResult?: string; status?: string; performedBy?: string; notes?: string; metaData?: any }) {
	try {
		const user = await requirePermission("testing", "create");

		const results = await Promise.allSettled(
			data.testSuiteIds.map((testSuiteId) =>
				TestService.createTest({
					...data,
					testSuiteId,
					createdBy: user.id,
				}),
			),
		);

		const successful = results.filter((result) => result.status === "fulfilled").length;
		const failed = results.filter((result) => result.status === "rejected").length;

		if (successful > 0) {
			revalidatePath("/test-management");
			revalidatePath(`/testing/${data.testOrderId}`);
		}

		return {
			success: successful > 0,
			message: `Created ${successful} test(s)${failed > 0 ? `, ${failed} failed` : ""}`,
			results: {
				successful,
				failed,
				total: data.testSuiteIds.length,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to bulk create tests: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
