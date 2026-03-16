/**
 * DesignReview Service
 * Business logic for DesignReviews
 */

import type { ActionResult } from "@/lib/types";

import { DesignReviewRepository } from "../repositories";
import type { CreateDesignReviewInput, DesignReviewFilters, DesignReviewWithRelations, UpdateDesignReviewInput } from "../types";

export class DesignReviewService {
	/**
	 * Get all reviews with filtering
	 */
	static async getDesignReviews(filters: DesignReviewFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignReviewWithRelations[]> {
		try {
			return await DesignReviewRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch reviews: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get review by ID
	 */
	static async getDesignReviewById(id: string): Promise<DesignReviewWithRelations | null> {
		try {
			return await DesignReviewRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch review: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new review
	 */
	static async createDesignReview(input: CreateDesignReviewInput & { createdBy: string }): Promise<ActionResult<DesignReviewWithRelations>> {
		try {
			if (!input.reviewerName?.trim()) {
				return {
					success: false,
					message: "Reviewer name is required",
				};
			}

			if (!input.designProjectId?.trim()) {
				return {
					success: false,
					message: "Design project ID is required",
				};
			}

			const review = await DesignReviewRepository.create(input);

			return {
				success: true,
				message: "Design review created",
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create review",
			};
		}
	}

	/**
	 * Update review
	 */
	static async updateDesignReview(id: string, input: UpdateDesignReviewInput & { updatedBy: string }): Promise<ActionResult<DesignReviewWithRelations>> {
		try {
			const existing = await DesignReviewRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Review not found",
				};
			}

			const review = await DesignReviewRepository.update(id, input);

			return {
				success: true,
				message: "Design review updated",
				data: review,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update review",
			};
		}
	}

	/**
	 * Delete review
	 */
	static async deleteDesignReview(id: string): Promise<ActionResult<void>> {
		try {
			const existing = await DesignReviewRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Review not found",
				};
			}

			await DesignReviewRepository.delete(id);

			return {
				success: true,
				message: "Design review deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete review",
			};
		}
	}

	/**
	 * Get reviews by project ID
	 */
	static async getReviewsByProjectId(projectId: string): Promise<DesignReviewWithRelations[]> {
		try {
			return await DesignReviewRepository.findByProjectId(projectId);
		} catch (error) {
			throw new Error(`Failed to fetch reviews: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get reviews by design ID
	 */
	static async getReviewsByDesignId(designId: string): Promise<DesignReviewWithRelations[]> {
		try {
			return await DesignReviewRepository.findByDesignId(designId);
		} catch (error) {
			throw new Error(`Failed to fetch reviews: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
