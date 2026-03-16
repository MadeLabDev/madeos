import { TestSuiteRepository } from "../repositories/test-suite.repository";
import type { CreateTestSuiteInput, GetTestSuitesOptions, UpdateTestSuiteInput } from "../types/test-suite.types";

/**
 * TestSuite Service
 * Business logic and validation for test suites
 */

export class TestSuiteService {
	/**
	 * Get all test suites with filters
	 */
	static async getAllTestSuites(options: GetTestSuitesOptions = {}) {
		return TestSuiteRepository.getAllTestSuites(options);
	}

	/**
	 * Get test suite by ID
	 */
	static async getTestSuiteById(id: string) {
		return TestSuiteRepository.getTestSuiteById(id);
	}

	/**
	 * Create a new test suite
	 */
	static async createTestSuite(data: CreateTestSuiteInput, userId?: string) {
		// Validation
		if (!data.name?.trim()) {
			throw new Error("Name is required");
		}

		if (data.estimatedHours !== undefined && data.estimatedHours < 0) {
			throw new Error("Estimated hours cannot be negative");
		}

		return TestSuiteRepository.createTestSuite(data, userId);
	}

	/**
	 * Update an existing test suite
	 */
	static async updateTestSuite(id: string, data: UpdateTestSuiteInput, userId?: string) {
		// Validation
		if (data.name !== undefined && !data.name.trim()) {
			throw new Error("Name cannot be empty");
		}

		if (data.estimatedHours !== undefined && data.estimatedHours < 0) {
			throw new Error("Estimated hours cannot be negative");
		}

		return TestSuiteRepository.updateTestSuite(id, data, userId);
	}

	/**
	 * Delete a test suite
	 */
	static async deleteTestSuite(id: string) {
		return TestSuiteRepository.deleteTestSuite(id);
	}

	/**
	 * Get test suites by category
	 */
	static async getTestSuitesByCategory(category: string) {
		return TestSuiteRepository.getTestSuitesByCategory(category);
	}

	/**
	 * Get all categories
	 */
	static async getCategories() {
		return TestSuiteRepository.getCategories();
	}
}
