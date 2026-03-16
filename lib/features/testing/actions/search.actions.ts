/**
 * Search Actions for Testing Module
 * Server actions for searching entities used in testing forms
 */

"use server";

import { getAllEngagements } from "@/lib/features/customers/services/customer-service";
import { TestOrderService } from "@/lib/features/testing/services";
import { TestSuiteService } from "@/lib/features/testing/services";
import { getUsers } from "@/lib/features/users/services/user-service";

/**
 * Search engagements for selection
 */
export async function searchEngagements(query: string = "", limit: number = 20) {
	try {
		const result = await getAllEngagements({
			search: query || undefined,
			pageSize: limit,
		});

		return {
			success: true,
			data: result.engagements.map((engagement) => ({
				value: engagement.id,
				label: engagement.title,
				description: `${engagement.customer?.companyName || "Unknown"} - ${engagement.description?.slice(0, 50)}${engagement.description && engagement.description.length > 50 ? "..." : ""}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search engagements: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search users for selection
 */
export async function searchUsers(query: string = "", limit: number = 20) {
	try {
		const result = await getUsers({
			search: query || undefined,
			pageSize: limit,
		});

		return {
			success: true,
			data: result.users.map((user) => ({
				value: user.id,
				label: user.name || user.email,
				description: user.email,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search users: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search test orders for selection
 */
export async function searchTestOrders(query: string = "", limit: number = 20) {
	try {
		const testOrders = await TestOrderService.getTestOrders(
			{
				search: query || undefined,
			},
			{
				take: limit,
			},
		);

		return {
			success: true,
			data: testOrders.map((testOrder) => ({
				value: testOrder.id,
				label: testOrder.title,
				description: `${testOrder.engagement?.customer?.companyName || "Unknown"} - ${testOrder.description?.slice(0, 50)}${testOrder.description && testOrder.description.length > 50 ? "..." : ""}`,
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search test orders: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}

/**
 * Search test suites for selection
 */
export async function searchTestSuites(query: string = "", limit: number = 20) {
	try {
		const testSuites = await TestSuiteService.getTestSuites(
			{
				search: query || undefined,
			},
			{
				take: limit,
			},
		);

		return {
			success: true,
			data: testSuites.map((testSuite) => ({
				value: testSuite.id,
				label: testSuite.name,
				description: testSuite.description?.slice(0, 50),
			})),
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to search test suites: ${error instanceof Error ? error.message : "Unknown error"}`,
			data: [],
		};
	}
}
