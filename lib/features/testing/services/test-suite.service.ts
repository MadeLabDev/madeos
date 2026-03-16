/**
 * TestSuite Service
 * Business logic for TestSuites
 */

import { TestSuiteRepository } from "@/lib/features/testing/repositories";
import type { AssignTestSuiteInput, CreateTestSuiteInput, TestSuiteFilters, TestSuiteWithRelations, UpdateTestSuiteInput } from "@/lib/features/testing/types";
import type { ActionResult } from "@/lib/types";

export class TestSuiteService {
	/**
	 * Get all test suites with pagination and filtering
	 */
	static async getTestSuites(filters: TestSuiteFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestSuiteWithRelations[]> {
		try {
			return await TestSuiteRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch test suites: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single test suite by ID
	 */
	static async getTestSuiteById(id: string): Promise<TestSuiteWithRelations | null> {
		try {
			return await TestSuiteRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch test suite: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new test suite
	 */
	static async createTestSuite(input: CreateTestSuiteInput & { createdBy: string }): Promise<ActionResult<TestSuiteWithRelations>> {
		try {
			const testSuite = await TestSuiteRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Test suite created",
				data: testSuite,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create test suite",
			};
		}
	}

	/**
	 * Update test suite
	 */
	static async updateTestSuite(id: string, input: UpdateTestSuiteInput & { updatedBy: string }): Promise<ActionResult<TestSuiteWithRelations>> {
		try {
			// Check if test suite exists
			const existingTestSuite = await TestSuiteRepository.findById(id);
			if (!existingTestSuite) {
				return {
					success: false,
					message: "Test suite not found",
				};
			}

			const testSuite = await TestSuiteRepository.update(id, input);

			return {
				success: true,
				message: "Test suite updated successfully",
				data: testSuite,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update test suite",
			};
		}
	}

	/**
	 * Delete test suite
	 */
	static async deleteTestSuite(id: string): Promise<ActionResult<void>> {
		try {
			// Check if test suite exists
			const existingTestSuite = await TestSuiteRepository.findById(id);
			if (!existingTestSuite) {
				return {
					success: false,
					message: "Test suite not found",
				};
			}

			await TestSuiteRepository.delete(id);

			return {
				success: true,
				message: "Test suite deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete test suite",
			};
		}
	}

	/**
	 * Assign test suite to test order
	 */
	static async assignTestSuiteToOrder(input: AssignTestSuiteInput & { assignedBy: string }): Promise<ActionResult<void>> {
		try {
			await TestSuiteRepository.assignToOrder(input.testOrderId, input.testSuiteId, input.assignedBy);

			return {
				success: true,
				message: "Test suite assigned to order successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to assign test suite to order",
			};
		}
	}

	/**
	 * Remove test suite from test order
	 */
	static async removeTestSuiteFromOrder(testOrderId: string, testSuiteId: string): Promise<ActionResult<void>> {
		try {
			await TestSuiteRepository.removeFromOrder(testOrderId, testSuiteId);

			return {
				success: true,
				message: "Test suite removed from order successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to remove test suite from order",
			};
		}
	}
}
