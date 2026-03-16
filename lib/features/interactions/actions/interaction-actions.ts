"use server";

import { revalidatePath } from "next/cache";

import { SITE_CONFIG } from "@/lib/config/site";
import { deleteEntityVectors, indexInteraction } from "@/lib/features/vector-search/actions";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

import * as interactionService from "../services/interaction-service";
import type { CreateInteractionInput, InteractionListParams, UpdateInteractionInput } from "../types/interaction.types";

// ============================================================================
// INTERACTION ACTIONS
// ============================================================================

export async function getInteractionsAction(params?: InteractionListParams & { pageSize?: number }): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const pageSize = params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize");
		const result = await interactionService.getAllInteractions({
			page: params?.page || 1,
			pageSize: pageSize,
			search: params?.search || "",
			customerId: params?.customerId,
			contactId: params?.contactId,
			type: params?.type,
		});

		return {
			success: true,
			message: "Interactions retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve interactions",
		};
	}
}

export async function getInteractionByIdAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const interaction = await interactionService.getInteractionById(id);
		return {
			success: true,
			message: "Interaction retrieved successfully",
			data: interaction,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve interaction",
		};
	}
}

export async function createInteractionAction(data: CreateInteractionInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "create");

		const interaction = await interactionService.createInteraction(data);

		await getPusher().trigger("private-global", "interaction_update", {
			action: "interaction_created",
			interaction,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/interactions");
		// Index for RAG search (non-blocking)
		try {
			await indexInteraction(interaction.id, interaction.type, interaction.subject, interaction.description || undefined);
		} catch (error) {
			console.warn("Failed to index interaction for RAG:", error);
		}
		return {
			success: true,
			message: "Interaction created successfully",
			data: interaction,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create interaction",
		};
	}
}

export async function updateInteractionAction(id: string, data: UpdateInteractionInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "update");

		const interaction = await interactionService.updateInteraction(id, data);

		await getPusher().trigger("private-global", "interaction_update", {
			action: "interaction_updated",
			interaction,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/interactions");
		// Re-index for RAG search (non-blocking)
		try {
			await deleteEntityVectors("interactions", id);
			await indexInteraction(interaction.id, interaction.type, interaction.subject, interaction.description || undefined);
		} catch (error) {
			console.warn("Failed to re-index interaction for RAG:", error);
		}
		return {
			success: true,
			message: "Interaction updated successfully",
			data: interaction,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update interaction",
		};
	}
}

export async function deleteInteractionAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const interaction = await interactionService.deleteInteraction(id);

		await getPusher().trigger("private-global", "interaction_update", {
			action: "interaction_deleted",
			interaction,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/interactions");
		// Remove from RAG search (non-blocking)
		try {
			await deleteEntityVectors("interactions", id);
		} catch (error) {
			console.warn("Failed to remove interaction from RAG:", error);
		}
		return {
			success: true,
			message: "Interaction deleted successfully",
			data: interaction,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete interaction",
		};
	}
}

export async function bulkDeleteInteractionsAction(ids: string[]): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const result = await interactionService.deleteMultipleInteractions(ids);

		await getPusher().trigger("private-global", "interaction_update", {
			action: "interactions_bulk_deleted",
			ids,
			count: result.count,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/interactions");
		// Remove from RAG search (non-blocking)
		try {
			for (const id of ids) {
				await deleteEntityVectors("interactions", id);
			}
		} catch (error) {
			console.warn("Failed to remove interactions from RAG:", error);
		}
		return {
			success: true,
			message: `${result.count} interactions deleted successfully`,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete interactions",
		};
	}
}

/**
 * Create interaction for a test order
 */
export async function createTestOrderInteractionAction(testOrderId: string, data: Omit<CreateInteractionInput, "testOrderId">): Promise<ActionResult> {
	try {
		await requirePermission("testing", "create");

		const interaction = await interactionService.createInteraction({
			...data,
			testOrderId,
		});

		await getPusher().trigger("private-global", "interaction_update", {
			action: "interaction_created",
			interaction,
			timestamp: new Date().toISOString(),
		});

		revalidatePath(`/testing/${testOrderId}`);
		return {
			success: true,
			message: "Test order interaction created successfully",
			data: interaction,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create test order interaction",
		};
	}
}
