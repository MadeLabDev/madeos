import type { ActionResult } from "@/lib/types";

import { SOPLibraryRepository } from "../repositories/sop-library.repository";
import type { CreateSOPInput, GetSOPsOptions, SOPLibraryWithRelations, SOPListResult, UpdateSOPInput } from "../types/sop-library.types";

/**
 * SOP Library Service
 * Business logic and validation for SOP management
 */

export class SOPLibraryService {
	/**
	 * Get all SOPs with pagination
	 */
	static async getAllSOPs(options: GetSOPsOptions = {}): Promise<SOPListResult> {
		const { page = 1, limit = 10 } = options;

		const { sops, total } = await SOPLibraryRepository.getAllSOPs(options);

		const totalPages = Math.ceil(total / limit);

		return {
			sops,
			total,
			page,
			limit,
			totalPages,
		};
	}

	/**
	 * Get SOP by ID
	 */
	static async getSOPById(id: string): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			const sop = await SOPLibraryRepository.getSOPById(id);

			if (!sop) {
				return {
					success: false,
					message: "SOP not found",
				};
			}

			return {
				success: true,
				message: "SOP retrieved successfully",
				data: sop,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve SOP";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Create new SOP
	 */
	static async createSOP(data: CreateSOPInput): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			// Validate required fields
			if (!data.title?.trim()) {
				return {
					success: false,
					message: "Title is required",
				};
			}

			// Validate version is positive number
			if (data.version !== undefined && data.version < 1) {
				return {
					success: false,
					message: "Version must be a positive number",
				};
			}

			// Generate slug from title if not provided
			if (!data.slug) {
				data.slug = data.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "");
			}

			// Validate slug is unique
			const existingSOP = await SOPLibraryRepository.getSOPBySlug(data.slug);
			if (existingSOP) {
				return {
					success: false,
					message: "Slug already exists. Please choose a different title or modify the slug.",
				};
			}

			const sop = await SOPLibraryRepository.createSOP(data);

			// Update review date if this is a published SOP
			if (sop.status === "PUBLISHED" && data.createdBy) {
				await SOPLibraryRepository.updateSOP(sop.id, {
					lastReviewedBy: data.createdBy,
					lastReviewedAt: new Date(),
				});
			}

			return {
				success: true,
				message: "SOP created successfully",
				data: sop,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create SOP";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Update SOP
	 */
	static async updateSOP(id: string, data: UpdateSOPInput): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			// Check if SOP exists
			const existing = await SOPLibraryRepository.getSOPById(id);
			if (!existing) {
				return {
					success: false,
					message: "SOP not found",
				};
			}

			// Validate title if provided
			if (data.title !== undefined && !data.title?.trim()) {
				return {
					success: false,
					message: "Title cannot be empty",
				};
			}

			// Validate version if provided
			if (data.version !== undefined && data.version < 1) {
				return {
					success: false,
					message: "Version must be a positive number",
				};
			}

			const sop = await SOPLibraryRepository.updateSOP(id, data);

			return {
				success: true,
				message: "SOP updated successfully",
				data: sop,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to update SOP";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Delete SOP
	 */
	static async deleteSOP(id: string): Promise<ActionResult<SOPLibraryWithRelations>> {
		try {
			// Check if SOP exists
			const existing = await SOPLibraryRepository.getSOPById(id);
			if (!existing) {
				return {
					success: false,
					message: "SOP not found",
				};
			}

			const sop = await SOPLibraryRepository.deleteSOP(id);

			return {
				success: true,
				message: "SOP deleted successfully",
				data: sop,
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to delete SOP";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Get all categories
	 */
	static async getAllCategories(): Promise<string[]> {
		return SOPLibraryRepository.getAllCategories();
	}

	/**
	 * Get SOP statistics
	 */
	static async getSOPStatistics(): Promise<ActionResult<any>> {
		try {
			const countsByStatus = await SOPLibraryRepository.getSOPCountByStatus();
			const categories = await SOPLibraryRepository.getAllCategories();

			return {
				success: true,
				message: "Statistics retrieved successfully",
				data: {
					countsByStatus,
					totalCategories: categories.length,
					categories,
				},
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to retrieve statistics";
			return {
				success: false,
				message,
			};
		}
	}

	/**
	 * Publish SOP (change status to PUBLISHED)
	 */
	static async publishSOP(id: string, userId: string): Promise<ActionResult<SOPLibraryWithRelations>> {
		return this.updateSOP(id, {
			id,
			status: "PUBLISHED",
			updatedBy: userId,
		});
	}

	/**
	 * Archive SOP (change status to ARCHIVED)
	 */
	static async archiveSOP(id: string, userId: string): Promise<ActionResult<SOPLibraryWithRelations>> {
		return this.updateSOP(id, {
			id,
			status: "ARCHIVED",
			updatedBy: userId,
		});
	}
}
