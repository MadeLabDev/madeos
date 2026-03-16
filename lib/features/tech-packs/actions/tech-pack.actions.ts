"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import { TechPackService } from "../services/tech-pack.service";
import type { CreateTechPackInput, GetTechPacksOptions, UpdateTechPackInput } from "../types/tech-pack.types";

/**
 * Get all tech packs with filters and pagination
 */
export async function listTechPacksAction(options: GetTechPacksOptions = {}): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const result = await TechPackService.getAllTechPacks(options);
		return { success: true, message: "Tech packs retrieved", data: result };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get a single tech pack by ID
 */
export async function getTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const techPack = await TechPackService.getTechPackById(id);

		if (!techPack) {
			return { success: false, message: "Tech pack not found" };
		}

		return { success: true, message: "Tech pack retrieved", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get tech pack by product design
 */
export async function getTechPackByProductDesignAction(productDesignId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const techPack = await TechPackService.getTechPackByProductDesign(productDesignId);
		return { success: true, message: "Tech pack retrieved", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Create a new tech pack
 */
export async function createTechPackAction(data: CreateTechPackInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");
		const session = await auth();
		const userId = session?.user?.id;

		const techPack = await TechPackService.createTechPack(data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "tech_pack_update", {
			action: "tech_pack_created",
			techPack,
		});

		// Revalidate paths
		revalidatePath("/design-development/tech-packs");
		revalidatePath(`/design-development/product-designs/${data.productDesignId}`);

		return { success: true, message: "Tech pack created", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Update an existing tech pack
 */
export async function updateTechPackAction(id: string, data: UpdateTechPackInput): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const techPack = await TechPackService.updateTechPack(id, data, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "tech_pack_update", {
			action: "tech_pack_updated",
			techPack,
		});

		// Revalidate paths
		revalidatePath("/design-development/tech-packs");
		revalidatePath(`/design-development/tech-packs/${id}`);
		if (techPack.productDesignId) {
			revalidatePath(`/design-development/product-designs/${techPack.productDesignId}`);
		}

		return { success: true, message: "Tech pack updated", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Delete a tech pack
 */
export async function deleteTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		const techPack = await TechPackService.deleteTechPack(id);

		// Trigger real-time update
		await getPusher().trigger("private-global", "tech_pack_update", {
			action: "tech_pack_deleted",
			techPackId: id,
		});

		// Revalidate paths
		revalidatePath("/design-development/tech-packs");
		if (techPack.productDesignId) {
			revalidatePath(`/design-development/product-designs/${techPack.productDesignId}`);
		}

		return { success: true, message: "Tech pack deleted", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Approve a tech pack
 */
export async function approveTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const techPack = await TechPackService.approveTechPack(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "tech_pack_update", {
			action: "tech_pack_approved",
			techPack,
		});

		// Revalidate paths
		revalidatePath("/design-development/tech-packs");
		revalidatePath(`/design-development/tech-packs/${id}`);

		return { success: true, message: "Tech pack approved", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Finalize a tech pack
 */
export async function finalizeTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");
		const session = await auth();
		const userId = session?.user?.id;

		const techPack = await TechPackService.finalizeTechPack(id, userId);

		// Trigger real-time update
		await getPusher().trigger("private-global", "tech_pack_update", {
			action: "tech_pack_finalized",
			techPack,
		});

		// Revalidate paths
		revalidatePath("/design-development/tech-packs");
		revalidatePath(`/design-development/tech-packs/${id}`);

		return { success: true, message: "Tech pack finalized", data: techPack };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}

/**
 * Get tech pack statistics
 */
export async function getTechPackStatisticsAction(): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const statistics = await TechPackService.getTechPackStatistics();
		return { success: true, message: "Statistics retrieved", data: statistics };
	} catch (error: any) {
		return { success: false, message: error.message };
	}
}
