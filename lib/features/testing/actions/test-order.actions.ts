/**
 * TestOrder Actions
 * Server actions for TestOrders
 */

"use server";

import { revalidatePath } from "next/cache";

import { TestOrderService } from "@/lib/features/testing/services";
import { CreateTestOrderInput, UpdateTestOrderInput } from "@/lib/features/testing/types";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

/**
 * Get test orders for selection (no permission required for basic listing)
 */
export async function getTestOrders(filters: Parameters<typeof TestOrderService.getTestOrders>[0] = {}, options: Parameters<typeof TestOrderService.getTestOrders>[1] = {}) {
	try {
		const testOrders = await TestOrderService.getTestOrders(filters, options);

		return {
			success: true,
			data: testOrders,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test orders: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get test orders list with filters for admin interface
 */
export async function getTestOrdersList(filters: Parameters<typeof TestOrderService.getTestOrders>[0] = {}, options: Parameters<typeof TestOrderService.getTestOrders>[1] = {}) {
	try {
		const testOrders = await TestOrderService.getTestOrders(filters, options);

		return {
			success: true,
			data: testOrders,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test orders: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get single test order by ID
 */
export async function getTestOrderById(id: string) {
	try {
		const testOrder = await TestOrderService.getTestOrderById(id);

		return {
			success: true,
			data: testOrder,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch test order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new test order
 */
export async function createTestOrder(data: CreateTestOrderInput) {
	try {
		const user = await requirePermission("testing", "create");

		const result = await TestOrderService.createTestOrder({
			...data,
			createdBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			// Broadcast to all users
			await broadcastToAll("test_order_update", {
				action: "test_order_created",
				testOrder: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create test order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update test order
 */
export async function updateTestOrder(id: string, data: UpdateTestOrderInput) {
	try {
		const user = await requirePermission("testing", "update");

		const result = await TestOrderService.updateTestOrder(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success) {
			revalidatePath("/test-management");
			revalidatePath(`/testing/test-orders/${id}`);
			// Broadcast to all users
			await broadcastToAll("test_order_update", {
				action: "test_order_updated",
				testOrder: result.data,
				testOrderId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update test order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete test order
 */
export async function deleteTestOrder(id: string) {
	try {
		await requirePermission("testing", "delete");

		const result = await TestOrderService.deleteTestOrder(id);

		if (result.success) {
			revalidatePath("/test-management");
			// Broadcast to all users
			await broadcastToAll("test_order_update", {
				action: "test_order_deleted",
				testOrderId: id,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete test order: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
