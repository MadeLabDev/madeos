/**
 * DesignReview Actions
 * Server actions for DesignReviews
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { DesignReviewService } from "../services";
import { CreateDesignReviewInput, UpdateDesignReviewInput } from "../types";

/**
 * Get design reviews
 */
export async function getDesignReviews(filters: Parameters<typeof DesignReviewService.getDesignReviews>[0] = {}, options: Parameters<typeof DesignReviewService.getDesignReviews>[1] = {}) {
	try {
		const reviews = await DesignReviewService.getDesignReviews(filters, options);
		return {
			success: true,
			data: reviews,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch reviews: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get design review by ID
 */
export async function getDesignReviewById(id: string) {
	try {
		const review = await DesignReviewService.getDesignReviewById(id);
		return {
			success: true,
			data: review,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch review: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new design review
 */
export async function createDesignReview(data: CreateDesignReviewInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await DesignReviewService.createDesignReview({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_review_update", {
				action: "design_review_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create review: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update design review
 */
export async function updateDesignReview(id: string, data: UpdateDesignReviewInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await DesignReviewService.updateDesignReview(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_review_update", {
				action: "design_review_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update review: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete design review
 */
export async function deleteDesignReview(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingReviewResult = await getDesignReviewById(id);
		const result = await DesignReviewService.deleteDesignReview(id);

		if (result.success && existingReviewResult.success && existingReviewResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_review_update", {
				action: "design_review_deleted",
				entity: existingReviewResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete review: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
