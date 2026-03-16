import { SampleRepository } from "../repositories/sample.repository";
import type { CreateSampleInput, GetSamplesOptions, UpdateSampleInput } from "../types/sample.types";

/**
 * Sample Service
 * Business logic and validation for samples
 */

export class SampleService {
	/**
	 * Get all samples with filters
	 */
	static async getAllSamples(options: GetSamplesOptions = {}) {
		return SampleRepository.getAllSamples(options);
	}

	/**
	 * Get sample by ID
	 */
	static async getSampleById(id: string) {
		return SampleRepository.getSampleById(id);
	}

	/**
	 * Get samples by test order
	 */
	static async getSamplesByTestOrder(testOrderId: string) {
		return SampleRepository.getSamplesByTestOrder(testOrderId);
	}

	/**
	 * Create a new sample
	 */
	static async createSample(data: CreateSampleInput, userId?: string) {
		// Validation
		if (!data.name?.trim()) {
			throw new Error("Name is required");
		}

		if (!data.testOrderId) {
			throw new Error("Test order is required");
		}

		if (data.quantity !== undefined && data.quantity <= 0) {
			throw new Error("Quantity must be positive");
		}

		return SampleRepository.createSample(data, userId);
	}

	/**
	 * Update an existing sample
	 */
	static async updateSample(id: string, data: UpdateSampleInput, userId?: string) {
		// Validation
		if (data.name !== undefined && !data.name.trim()) {
			throw new Error("Name cannot be empty");
		}

		if (data.quantity !== undefined && data.quantity <= 0) {
			throw new Error("Quantity must be positive");
		}

		return SampleRepository.updateSample(id, data, userId);
	}

	/**
	 * Delete a sample
	 */
	static async deleteSample(id: string) {
		return SampleRepository.deleteSample(id);
	}

	/**
	 * Get sample statistics
	 */
	static async getSampleStatistics() {
		const countByStatus = await SampleRepository.getSampleCountByStatus();

		return {
			byStatus: countByStatus,
		};
	}
}
