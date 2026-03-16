/**
 * Test Service
 * Business logic for Tests
 */

import type { ActionResult } from "@/lib/types";

import { TestRepository } from "../repositories";
import type { CreateTestInput, TestFilters, TestWithRelations, UpdateTestInput } from "../types";

export class TestService {
	/**
	 * Get all tests with pagination and filtering
	 */
	static async getTests(filters: TestFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestWithRelations[]> {
		try {
			return await TestRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch tests: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single test by ID
	 */
	static async getTestById(id: string): Promise<TestWithRelations | null> {
		try {
			return await TestRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch test: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new test
	 */
	static async createTest(input: CreateTestInput & { createdBy: string }): Promise<ActionResult<TestWithRelations>> {
		try {
			const test = await TestRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Test created",
				data: test,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create test",
			};
		}
	}

	/**
	 * Update test
	 */
	static async updateTest(id: string, input: UpdateTestInput & { updatedBy: string }): Promise<ActionResult<TestWithRelations>> {
		try {
			// Check if test exists
			const existingTest = await TestRepository.findById(id);
			if (!existingTest) {
				return {
					success: false,
					message: "Test not found",
				};
			}

			const test = await TestRepository.update(id, input);

			return {
				success: true,
				message: "Test updated successfully",
				data: test,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update test",
			};
		}
	}

	/**
	 * Delete test
	 */
	static async deleteTest(id: string): Promise<ActionResult<void>> {
		try {
			// Check if test exists
			const existingTest = await TestRepository.findById(id);
			if (!existingTest) {
				return {
					success: false,
					message: "Test not found",
				};
			}

			await TestRepository.delete(id);

			return {
				success: true,
				message: "Test deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete test",
			};
		}
	}
}
