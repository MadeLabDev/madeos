/**
 * Sample Service
 * Business logic for Samples
 */

import { SampleRepository } from "@/lib/features/testing/repositories";
import type { CreateSampleInput, SampleFilters, SampleWithRelations, UpdateSampleInput } from "@/lib/features/testing/types";
import type { ActionResult } from "@/lib/types";

export class SampleService {
	/**
	 * Get all samples with pagination and filtering
	 */
	static async getSamples(filters: SampleFilters = {}, options: { skip?: number; take?: number } = {}): Promise<SampleWithRelations[]> {
		try {
			return await SampleRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch samples: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single sample by ID
	 */
	static async getSampleById(id: string): Promise<SampleWithRelations | null> {
		try {
			return await SampleRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch sample: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new sample
	 */
	static async createSample(input: CreateSampleInput & { createdBy: string }): Promise<ActionResult<SampleWithRelations>> {
		try {
			const sample = await SampleRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "Sample created",
				data: sample,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create sample",
			};
		}
	}

	/**
	 * Update sample
	 */
	static async updateSample(id: string, input: UpdateSampleInput & { updatedBy: string }): Promise<ActionResult<SampleWithRelations>> {
		try {
			// Check if sample exists
			const existingSample = await SampleRepository.findById(id);
			if (!existingSample) {
				return {
					success: false,
					message: "Sample not found",
				};
			}

			const sample = await SampleRepository.update(id, input);

			return {
				success: true,
				message: "Sample updated successfully",
				data: sample,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update sample",
			};
		}
	}

	/**
	 * Delete sample
	 */
	static async deleteSample(id: string): Promise<ActionResult<void>> {
		try {
			// Check if sample exists
			const existingSample = await SampleRepository.findById(id);
			if (!existingSample) {
				return {
					success: false,
					message: "Sample not found",
				};
			}

			await SampleRepository.delete(id);

			return {
				success: true,
				message: "Sample deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete sample",
			};
		}
	}
}
