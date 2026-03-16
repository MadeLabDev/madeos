/**
 * TestReport Service
 * Business logic for TestReports
 */

import type { ActionResult } from "@/lib/types";

import { TestReportRepository } from "../repositories";
import type { CreateTestReportInput, TestReportFilters, TestReportWithRelations, UpdateTestReportInput } from "../types";

export class TestReportService {
	/**
	 * Get all test reports with pagination and filtering
	 */
	static async getTestReports(filters: TestReportFilters = {}, options: { skip?: number; take?: number } = {}): Promise<TestReportWithRelations[]> {
		try {
			return await TestReportRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch test reports: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single test report by ID
	 */
	static async getTestReportById(id: string): Promise<TestReportWithRelations | null> {
		try {
			return await TestReportRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch test report: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new test report
	 */
	static async createTestReport(input: CreateTestReportInput & { createdBy: string }): Promise<ActionResult<TestReportWithRelations>> {
		try {
			const testReport = await TestReportRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Test report created",
				data: testReport,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create test report",
			};
		}
	}

	/**
	 * Update test report
	 */
	static async updateTestReport(id: string, input: UpdateTestReportInput & { updatedBy: string }): Promise<ActionResult<TestReportWithRelations>> {
		try {
			// Check if test report exists
			const existingTestReport = await TestReportRepository.findById(id);
			if (!existingTestReport) {
				return {
					success: false,
					message: "Test report not found",
				};
			}

			const testReport = await TestReportRepository.update(id, input);

			return {
				success: true,
				message: "Test report updated successfully",
				data: testReport,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update test report",
			};
		}
	}

	/**
	 * Delete test report
	 */
	static async deleteTestReport(id: string): Promise<ActionResult<void>> {
		try {
			// Check if test report exists
			const existingTestReport = await TestReportRepository.findById(id);
			if (!existingTestReport) {
				return {
					success: false,
					message: "Test report not found",
				};
			}

			await TestReportRepository.delete(id);

			return {
				success: true,
				message: "Test report deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete test report",
			};
		}
	}
}
