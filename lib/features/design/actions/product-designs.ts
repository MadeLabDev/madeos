"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { createProductDesignService, deleteProductDesignService, getProductDesignByIdService, getProductDesignsService, incrementProductDesignVersionService, updateProductDesignService } from "../services/product-design-service";
import { ActionResult } from "../types";

export async function getProductDesignsAction(params: Parameters<typeof getProductDesignsService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getProductDesignsService(params);
		return {
			success: true,
			message: "Product designs fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch product designs",
		};
	}
}

export async function getProductDesignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getProductDesignByIdService(id);
		return {
			success: true,
			message: "Product design fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch product design",
		};
	}
}

export async function createProductDesignAction(input: Parameters<typeof createProductDesignService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await createProductDesignService({
			...input,
			createdBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "product_design_created",
			data,
		});

		revalidatePath(`/design-projects/${input.designProjectId}/designs`);

		return {
			success: true,
			message: "Product design created successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create product design",
		};
	}
}

export async function updateProductDesignAction(id: string, input: Parameters<typeof updateProductDesignService>[1]): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await updateProductDesignService(id, {
			...input,
			updatedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "product_design_updated",
			data,
		});

		revalidatePath(`/design-projects/${data.designProjectId}/designs`);
		revalidatePath(`/design-projects/${data.designProjectId}/designs/${id}`);

		return {
			success: true,
			message: "Product design updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update product design",
		};
	}
}

export async function deleteProductDesignAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const design = await getProductDesignByIdService(id);

		await deleteProductDesignService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "product_design_deleted",
			designId: id,
		});

		revalidatePath(`/design-projects/${design.designProjectId}/designs`);

		return {
			success: true,
			message: "Product design deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete product design",
		};
	}
}

export async function incrementProductDesignVersionAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const data = await incrementProductDesignVersionService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "product_design_version_incremented",
			data,
		});

		revalidatePath(`/design-projects`);

		return {
			success: true,
			message: `Product design updated to version ${data.version}`,
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to increment design version",
		};
	}
}
