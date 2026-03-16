import { TestOrderRepository } from "@/lib/features/test-orders/repositories/test-order.repository";
import type { CreateTestOrderInput, GetTestOrdersOptions, UpdateTestOrderInput } from "@/lib/features/test-orders/types/test-order.types";

/**
 * TestOrder Service
 * Business logic and validation for test orders
 */

export class TestOrderService {
	/**
	 * Get all test orders with filters
	 */
	static async getAllTestOrders(options: GetTestOrdersOptions = {}) {
		return TestOrderRepository.getAllTestOrders(options);
	}

	/**
	 * Get test order by ID
	 */
	static async getTestOrderById(id: string) {
		return TestOrderRepository.getTestOrderById(id);
	}

	/**
	 * Get test orders by engagement
	 */
	static async getTestOrdersByEngagement(engagementId: string) {
		return TestOrderRepository.getTestOrdersByEngagement(engagementId);
	}

	/**
	 * Create a new test order
	 */
	static async createTestOrder(data: CreateTestOrderInput, userId?: string) {
		// Validation
		if (!data.title?.trim()) {
			throw new Error("Title is required");
		}

		if (!data.engagementId) {
			throw new Error("Engagement ID is required");
		}

		if (!data.requestedBy) {
			throw new Error("Requested by is required");
		}

		if (data.budget !== undefined && data.budget < 0) {
			throw new Error("Budget cannot be negative");
		}

		// Validate dates
		if (data.startDate && data.dueDate && data.dueDate <= data.startDate) {
			throw new Error("Due date must be after start date");
		}

		return TestOrderRepository.createTestOrder(data, userId);
	}

	/**
	 * Update an existing test order
	 */
	static async updateTestOrder(id: string, data: UpdateTestOrderInput, userId?: string) {
		// Validation
		if (data.title !== undefined && !data.title.trim()) {
			throw new Error("Title cannot be empty");
		}

		if (data.budget !== undefined && data.budget < 0) {
			throw new Error("Budget cannot be negative");
		}

		// Validate dates
		if (data.startDate && data.dueDate && data.dueDate <= data.startDate) {
			throw new Error("Due date must be after start date");
		}

		return TestOrderRepository.updateTestOrder(id, data, userId);
	}

	/**
	 * Delete a test order
	 */
	static async deleteTestOrder(id: string) {
		return TestOrderRepository.deleteTestOrder(id);
	}

	/**
	 * Get test order statistics
	 */
	static async getTestOrderStatistics() {
		const countByStatus = await TestOrderRepository.getTestOrderCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}
