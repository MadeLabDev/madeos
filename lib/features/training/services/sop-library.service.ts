/**
 * SOPLibrary Service
 * Business logic for SOPLibraries
 */

import type { ActionResult } from "@/lib/types";

import { SOPLibraryRepository } from "../repositories";
import type { CreateSOPLibraryInput, SOPLibraryFilters, SOPLibraryWithRelations, UpdateSOPLibraryInput } from "../types";

export class SOPLibraryService {
	/**
	 * Get all SOP libraries with pagination and filtering
	 */
	static async getSOPLibraries(filters: SOPLibraryFilters = {}, options: { skip?: number; take?: number } = {}): Promise<SOPLibraryWithRelations[]> {
		try {
			return await SOPLibraryRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch SOP libraries: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get single SOP library by ID
	 */
	static async getSOPLibraryById(id: string): Promise<SOPLibraryWithRelations | null> {
		try {
			return await SOPLibraryRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch SOP library: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new SOP library
	 */
	static async createSOPLibrary(input: CreateSOPLibraryInput & { createdBy: string }): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			const sopLibrary = await SOPLibraryRepository.create({
				...input,
				updatedBy: input.createdBy,
			});

			return {
				success: true,
				message: "SOP library created successfully",
				data: sopLibrary,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create SOP library",
			};
		}
	}

	/**
	 * Update SOP library
	 */
	static async updateSOPLibrary(id: string, input: UpdateSOPLibraryInput & { updatedBy: string }): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			// Check if SOP library exists
			const existingSOPLibrary = await SOPLibraryRepository.findById(id);
			if (!existingSOPLibrary) {
				return {
					success: false,
					message: "SOP library not found",
				};
			}

			const sopLibrary = await SOPLibraryRepository.update(id, input);

			return {
				success: true,
				message: "SOP library updated successfully",
				data: sopLibrary,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update SOP library",
			};
		}
	}

	/**
	 * Delete SOP library
	 */
	static async deleteSOPLibrary(id: string): Promise<ActionResult<void>> {
		try {
			// Check if SOP library exists
			const existingSOPLibrary = await SOPLibraryRepository.findById(id);
			if (!existingSOPLibrary) {
				return {
					success: false,
					message: "SOP library not found",
				};
			}

			await SOPLibraryRepository.delete(id);

			return {
				success: true,
				message: "SOP library deleted successfully",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete SOP library",
			};
		}
	}
}
