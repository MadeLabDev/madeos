/**
 * DesignDeck Actions
 * Server actions for DesignDecks
 */

"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import { DesignDeckService } from "../services";
import { CreateDesignDeckInput, UpdateDesignDeckInput } from "../types";

/**
 * Get design decks
 */
export async function getDesignDecks(filters: Parameters<typeof DesignDeckService.getDesignDecks>[0] = {}, options: Parameters<typeof DesignDeckService.getDesignDecks>[1] = {}) {
	try {
		const decks = await DesignDeckService.getDesignDecks(filters, options);
		return {
			success: true,
			data: decks,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch decks: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Get design deck by ID
 */
export async function getDesignDeckById(id: string) {
	try {
		const deck = await DesignDeckService.getDesignDeckById(id);
		return {
			success: true,
			data: deck,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to fetch deck: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Create new design deck
 */
export async function createDesignDeck(data: CreateDesignDeckInput) {
	try {
		const user = await requirePermission("design", "create");

		const result = await DesignDeckService.createDesignDeck({
			...data,
			createdBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_deck_update", {
				action: "design_deck_created",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to create deck: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Update design deck
 */
export async function updateDesignDeck(id: string, data: UpdateDesignDeckInput) {
	try {
		const user = await requirePermission("design", "update");

		const result = await DesignDeckService.updateDesignDeck(id, {
			...data,
			updatedBy: user.id,
		});

		if (result.success && result.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_deck_update", {
				action: "design_deck_updated",
				entity: result.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to update deck: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Delete design deck
 */
export async function deleteDesignDeck(id: string) {
	try {
		await requirePermission("design", "delete");

		const existingDeckResult = await getDesignDeckById(id);
		const result = await DesignDeckService.deleteDesignDeck(id);

		if (result.success && existingDeckResult.success && existingDeckResult.data) {
			revalidatePath("/design-projects");
			await broadcastToAll("design_deck_update", {
				action: "design_deck_deleted",
				entity: existingDeckResult.data,
				timestamp: new Date().toISOString(),
			});
		}

		return result;
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete deck: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}
