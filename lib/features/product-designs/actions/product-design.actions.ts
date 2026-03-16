"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { ProductDesignService } from "../services/product-design.service";
import type { CreateProductDesignInput, GetProductDesignsOptions, UpdateProductDesignInput } from "../types/product-design.types";

/**
 * Get all product designs with filters and pagination
 */
export async function listProductDesignsAction(options: GetProductDesignsOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const result = await ProductDesignService.getAllProductDesigns(options);
		return { success: true, message: "Product designs retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single product design by ID
 */
export async function getProductDesignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const productDesign = await ProductDesignService.getProductDesignById(id);

		if (!productDesign) {
			return { success: false, message: "Product design not found" };
		}

		return { success: true, message: "Product design retrieved", data: productDesign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get product designs by project
 */
export async function getProductDesignsByProjectAction(designProjectId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const productDesigns = await ProductDesignService.getProductDesignsByProject(designProjectId);
		return { success: true, message: "Product designs retrieved", data: productDesigns };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new product design
 */
export async function createProductDesignAction(data: CreateProductDesignInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const productDesign = await ProductDesignService.createProductDesign(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "product_design_update", {
			action: "design_created",
			productDesign,
		});

		// Revalidate paths
		revalidatePath("/design-development/product-designs");
		revalidatePath(`/design-development/projects/${data.designProjectId}`);

		return { success: true, message: "Product design created", data: productDesign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing product design
 */
export async function updateProductDesignAction(id: string, data: UpdateProductDesignInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const productDesign = await ProductDesignService.updateProductDesign(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "product_design_update", {
			action: "design_updated",
			productDesign,
		});

		// Revalidate paths
		revalidatePath("/design-development/product-designs");
		revalidatePath(`/design-development/product-designs/${id}`);
		if (productDesign.designProjectId) {
			revalidatePath(`/design-development/projects/${productDesign.designProjectId}`);
		}

		return { success: true, message: "Product design updated", data: productDesign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a product design
 */
export async function deleteProductDesignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const productDesign = await ProductDesignService.deleteProductDesign(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "product_design_update", {
			action: "design_deleted",
			productDesignId: id,
		});

		// Revalidate paths
		revalidatePath("/design-development/product-designs");
		if (productDesign.designProjectId) {
			revalidatePath(`/design-development/projects/${productDesign.designProjectId}`);
		}

		return { success: true, message: "Product design deleted", data: productDesign };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get product design statistics
 */
export async function getProductDesignStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const statistics = await ProductDesignService.getProductDesignStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
