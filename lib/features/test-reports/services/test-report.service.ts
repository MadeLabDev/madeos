import { TestReportRepository } from "../repositories/test-report.repository";
import type { CreateTestReportInput, GetTestReportsOptions, UpdateTestReportInput } from "../types/test-report.types";

/**
 * TestReport Service
 * Business logic and validation for test reports
 */

export class TestReportService {
	/**
	 * Get all test reports with filters
	 */
	static async getAllTestReports(options: GetTestReportsOptions = {}) {
		return TestReportRepository.getAllTestReports(options);
	}

	/**
	 * Get test report by ID
	 */
	static async getTestReportById(id: string) {
		return TestReportRepository.getTestReportById(id);
	}

	/**
	 * Get test reports by test order
	 */
	static async getTestReportsByTestOrder(testOrderId: string) {
		return TestReportRepository.getTestReportsByTestOrder(testOrderId);
	}

	/**
	 * Create a new test report
	 */
	static async createTestReport(data: CreateTestReportInput, userId?: string) {
		// Validation
		if (!data.title?.trim()) {
			throw new Error("Title is required");
		}

		if (!data.testOrderId) {
			throw new Error("Test order ID is required");
		}

		return TestReportRepository.createTestReport(data, userId);
	}

	/**
	 * Update an existing test report
	 */
	static async updateTestReport(id: string, data: UpdateTestReportInput, userId?: string) {
		// Validation
		if (data.title !== undefined && !data.title.trim()) {
			throw new Error("Title cannot be empty");
		}

		return TestReportRepository.updateTestReport(id, data, userId);
	}

	/**
	 * Delete a test report
	 */
	static async deleteTestReport(id: string) {
		return TestReportRepository.deleteTestReport(id);
	}

	/**
	 * Publish a test report
	 */
	static async publishTestReport(id: string, userId?: string) {
		return TestReportRepository.publishTestReport(id, userId);
	}

	/**
	 * Approve a test report
	 */
	static async approveTestReport(id: string, userId?: string) {
		return TestReportRepository.approveTestReport(id, userId);
	}

	/**
	 * Get test report statistics
	 */
	static async getTestReportStatistics() {
		const countByStatus = await TestReportRepository.getTestReportCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}
