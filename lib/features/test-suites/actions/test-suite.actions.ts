"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { TestSuiteService } from "../services/test-suite.service";
import type { CreateTestSuiteInput, GetTestSuitesOptions, UpdateTestSuiteInput } from "../types/test-suite.types";

/**
 * Get all test suites with filters and pagination
 */
export async function listTestSuitesAction(options: GetTestSuitesOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const result = await TestSuiteService.getAllTestSuites(options);
		return { success: true, message: "Test suites retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single test suite by ID
 */
export async function getTestSuiteAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testSuite = await TestSuiteService.getTestSuiteById(id);

		if (!testSuite) {
			return { success: false, message: "Test suite not found" };
		}

		return { success: true, message: "Test suite retrieved", data: testSuite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new test suite
 */
export async function createTestSuiteAction(data: CreateTestSuiteInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const testSuite = await TestSuiteService.createTestSuite(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_suite_update", {
			action: "suite_created",
			testSuite,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-suites");

		return { success: true, message: "Test suite created", data: testSuite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing test suite
 */
export async function updateTestSuiteAction(id: string, data: UpdateTestSuiteInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const testSuite = await TestSuiteService.updateTestSuite(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_suite_update", {
			action: "suite_updated",
			testSuite,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-suites");
		revalidatePath(`/testing-development/test-suites/${id}`);

		return { success: true, message: "Test suite updated", data: testSuite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a test suite
 */
export async function deleteTestSuiteAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "delete");

		const testSuite = await TestSuiteService.deleteTestSuite(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_suite_update", {
			action: "suite_deleted",
			testSuiteId: id,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-suites");

		return { success: true, message: "Test suite deleted", data: testSuite };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get test suites by category
 */
export async function getTestSuitesByCategoryAction(category: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testSuites = await TestSuiteService.getTestSuitesByCategory(category);
		return { success: true, message: "Test suites retrieved", data: testSuites };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get all test suite categories
 */
export async function getTestSuiteCategoriesAction(): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const categories = await TestSuiteService.getCategories();
		return { success: true, message: "Categories retrieved", data: categories };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
