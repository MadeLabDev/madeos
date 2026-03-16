"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { createTechPackService, deleteTechPackService, getTechPackByIdService, getTechPacksService, updateTechPackService } from "../services/tech-pack-service";
import { ActionResult } from "../types";

export async function getTechPacksAction(productDesignId: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getTechPacksService(productDesignId);
		return {
			success: true,
			message: "Tech packs fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch tech packs",
		};
	}
}

export async function getTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "read");
		const data = await getTechPackByIdService(id);
		return {
			success: true,
			message: "Tech pack fetched",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch tech pack",
		};
	}
}

export async function createTechPackAction(input: Parameters<typeof createTechPackService>[0]): Promise<ActionResult> {
	try {
		await requirePermission("design", "create");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await createTechPackService({
			...input,
			createdBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "tech_pack_created",
			data,
		});

		revalidatePath(`/design-projects/tech-packs`);

		return {
			success: true,
			message: "Tech pack created successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create tech pack",
		};
	}
}

export async function updateTechPackAction(id: string, input: Parameters<typeof updateTechPackService>[1]): Promise<ActionResult> {
	try {
		await requirePermission("design", "update");

		const session = await auth();
		const userId = session?.user?.id;

		const data = await updateTechPackService(id, {
			...input,
			updatedBy: userId,
		});

		await getPusher().trigger("private-global", "design_update", {
			action: "tech_pack_updated",
			data,
		});

		revalidatePath(`/design-projects/tech-packs`);

		return {
			success: true,
			message: "Tech pack updated successfully",
			data,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update tech pack",
		};
	}
}

export async function deleteTechPackAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("design", "delete");

		await deleteTechPackService(id);

		await getPusher().trigger("private-global", "design_update", {
			action: "tech_pack_deleted",
			packId: id,
		});

		revalidatePath(`/design-projects/tech-packs`);

		return {
			success: true,
			message: "Tech pack deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete tech pack",
		};
	}
}
