/**
 * ProductDesign Actions
 * Server actions for ProductDesigns
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { ProductDesignService } from "../services";
import { CreateProductDesignInput, UpdateProductDesignInput } from "../types";

/**
 * Get product designs
 */
export async function getProductDesigns(filters: Parameters<typeof ProductDesignService.getProductDesigns>[0] = {}, options: Parameters<typeof ProductDesignService.getProductDesigns>[1] = {}) {
	try {
		const designs = await ProductDesignService.getProductDesigns(filters, options);
		return {
			success: true,
			data: designs,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch designs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get product design by ID
 */
export async function getProductDesignById(id: string) {
	try {
		const design = await ProductDesignService.getProductDesignById(id);
		return {
			success: true,
			data: design,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch design: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get product design by ID (alias for getProductDesignById)
 */
export async function getProductDesign(id: string) {
	return getProductDesignById(id);
}

/**
 * Create new product design
 */
export async function createProductDesign(data: CreateProductDesignInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await ProductDesignService.createProductDesign({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("product_design_update", {
				action: "product_design_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create design: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update product design
 */
export async function updateProductDesign(id: string, data: UpdateProductDesignInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await ProductDesignService.updateProductDesign(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("product_design_update", {
				action: "product_design_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update design: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete product design
 */
export async function deleteProductDesign(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingDesignResult = await getProductDesignById(id);
		const result = await ProductDesignService.deleteProductDesign(id);

		if (result.success && existingDesignResult.success && existingDesignResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("product_design_update", {
				action: "product_design_deleted",
				entity: existingDesignResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete design: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Bulk delete product designs
 */
export async function bulkDeleteProductDesigns(ids: string[]) {
	try {
		await requirePermission("design", "delete");

		const result = await ProductDesignService.bulkDeleteProductDesigns(ids);

		if (result.success) {
			revalidatePath("/design-projects");
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to bulk delete designs: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
