/**
 * TestOrder Service
 * Business logic for TestOrders
 */

import { TestOrderRepository } from "@/lib/features/testing/repositories";
import type { CreateTestOrderInput, TestOrderFilters, TestOrderWithRelations, UpdateTestOrderInput } from "@/lib/features/testing/types";
import type { ActionResult } from "@/lib/types";

export class TestOrderService {
	/**
	 * Get all test orders with pagination and filtering
	 */
	static async getTestOrders(filters: TestOrderFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestOrderWithRelations[]> {
		try {
			return await TestOrderRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch test orders: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single test order by ID
	 */
	static async getTestOrderById(id: string): Promise<TestOrderWithRelations | null> {
		try {
			return await TestOrderRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch test order: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new test order
	 */
	static async createTestOrder(input: CreateTestOrderInput & { createdBy: string }): Promise<ActionResult<TestOrderWithRelations>> {
		try {
			const testOrder = await TestOrderRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Test order created",
				data: testOrder,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create test order",
			};
		}
	}

	/**
	 * Update test order
	 */
	static async updateTestOrder(id: string, input: UpdateTestOrderInput & { updatedBy: string }): Promise<ActionResult<TestOrderWithRelations>> {
		try {
			// Check if test order exists
			const existingTestOrder = await TestOrderRepository.findById(id);
			if (!existingTestOrder) {
				return {
					success: false,
					message: "Test order not found",
				};
			}

			const testOrder = await TestOrderRepository.update(id, input);

			return {
				success: true,
				message: "Test order updated successfully",
				data: testOrder,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update test order",
			};
		}
	}

	/**
	 * Delete test order
	 */
	static async deleteTestOrder(id: string): Promise<ActionResult<void>> {
		try {
			// Check if test order exists
			const existingTestOrder = await TestOrderRepository.findById(id);
			if (!existingTestOrder) {
				return {
					success: false,
					message: "Test order not found",
				};
			}

			await TestOrderRepository.delete(id);

			return {
				success: true,
				message: "Test order deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete test order",
			};
		}
	}
}
