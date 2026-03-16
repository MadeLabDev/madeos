"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { TestOrderService } from "@/lib/features/test-orders/services/test-order.service";
import type { CreateTestOrderInput, GetTestOrdersOptions, UpdateTestOrderInput } from "@/lib/features/test-orders/types/test-order.types";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

/**
 * Get all test orders with filters and pagination
 */
export async function listTestOrdersAction(options: GetTestOrdersOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const result = await TestOrderService.getAllTestOrders(options);
		return { success: true, message: "Test orders retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single test order by ID
 */
export async function getTestOrderAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testOrder = await TestOrderService.getTestOrderById(id);

		if (!testOrder) {
			return { success: false, message: "Test order not found" };
		}

		return { success: true, message: "Test order retrieved", data: testOrder };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get test orders by engagement
 */
export async function getTestOrdersByEngagementAction(engagementId: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const testOrders = await TestOrderService.getTestOrdersByEngagement(engagementId);
		return { success: true, message: "Test orders retrieved", data: testOrders };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new test order
 */
export async function createTestOrderAction(data: CreateTestOrderInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const testOrder = await TestOrderService.createTestOrder(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_order_update", {
			action: "order_created",
			testOrder,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-orders");
		revalidatePath(`/testing-development/engagements/${data.engagementId}`);

		return { success: true, message: "Test order created", data: testOrder };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing test order
 */
export async function updateTestOrderAction(id: string, data: UpdateTestOrderInput): Promise<ActionResult> {
	try {
		await requirePermission("testing", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const testOrder = await TestOrderService.updateTestOrder(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_order_update", {
			action: "order_updated",
			testOrder,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-orders");
		revalidatePath(`/testing-development/test-orders/${id}`);
		if (testOrder.engagementId) {
			revalidatePath(`/testing-development/engagements/${testOrder.engagementId}`);
		}

		return { success: true, message: "Test order updated", data: testOrder };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a test order
 */
export async function deleteTestOrderAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("testing", "delete");

		const testOrder = await TestOrderService.deleteTestOrder(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "test_order_update", {
			action: "order_deleted",
			testOrderId: id,
		});

		// Revalidate paths
		revalidatePath("/testing-development/test-orders");
		if (testOrder.engagementId) {
			revalidatePath(`/testing-development/engagements/${testOrder.engagementId}`);
		}

		return { success: true, message: "Test order deleted", data: testOrder };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get test order statistics
 */
export async function getTestOrderStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("testing", "read");
		const statistics = await TestOrderService.getTestOrderStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
