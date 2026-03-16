"use server";

import { revalidatePath } from "next/cache";

import { SITE_CONFIG } from "@/lib/config/site";
import * as opportunityService from "@/lib/features/opportunities/services/opportunity-service";
import type { CreateOpportunityInput, OpportunityListParams, UpdateOpportunityInput } from "@/lib/features/opportunities/types/opportunity.types";
import { requirePermission } from "@/lib/permissions";
import { getPusher } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// OPPORTUNITY ACTIONS
// ============================================================================

export async function getOpportunitiesAction(params?: OpportunityListParams & { pageSize?: number }): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const pageSize = params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize");
		const result = await opportunityService.getAllOpportunities({
			page: params?.page || 1,
			pageSize: pageSize,
			search: params?.search || "",
			customerId: params?.customerId,
			stage: params?.stage,
		});

		return {
			success: true,
			message: "Opportunities retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve opportunities",
		};
	}
}

export async function getOpportunityByIdAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("customers", "read");

		const opportunity = await opportunityService.getOpportunityById(id);
		return {
			success: true,
			message: "Opportunity retrieved successfully",
			data: opportunity,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve opportunity",
		};
	}
}

export async function createOpportunityAction(data: CreateOpportunityInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "create");

		const opportunity = await opportunityService.createOpportunity(data);

		// Index in vector search (non-blocking)
		try {
			const { indexOpportunity } = await import("@/lib/features/vector-search/actions");
			await indexOpportunity(opportunity.id, opportunity.title, opportunity.description || "", opportunity.stage, opportunity.value || undefined);
		} catch (indexError) {
			console.warn("Failed to index opportunity:", indexError);
		}

		await getPusher().trigger("private-global", "opportunity_update", {
			action: "opportunity_created",
			opportunity,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/opportunities");
		return {
			success: true,
			message: "Opportunity created successfully",
			data: opportunity,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create opportunity",
		};
	}
}

export async function updateOpportunityAction(id: string, data: UpdateOpportunityInput): Promise<ActionResult> {
	try {
		await requirePermission("customers", "update");

		const opportunity = await opportunityService.updateOpportunity(id, data);

		// Re-index in vector search (non-blocking)
		try {
			const { deleteEntityVectors, indexOpportunity } = await import("@/lib/features/vector-search/actions");
			// Delete old vectors
			await deleteEntityVectors("opportunities", id);
			// Index updated content
			await indexOpportunity(opportunity.id, opportunity.title, opportunity.description || "", opportunity.stage, opportunity.value || undefined);
		} catch (indexError) {
			console.warn("Failed to re-index opportunity:", indexError);
		}

		await getPusher().trigger("private-global", "opportunity_update", {
			action: "opportunity_updated",
			opportunity,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/opportunities");
		return {
			success: true,
			message: "Opportunity updated successfully",
			data: opportunity,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update opportunity",
		};
	}
}

export async function deleteOpportunityAction(id: string): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const opportunity = await opportunityService.deleteOpportunity(id);

		// Clean up vectors (non-blocking)
		try {
			const { deleteEntityVectors } = await import("@/lib/features/vector-search/actions");
			await deleteEntityVectors("opportunities", id);
		} catch (indexError) {
			console.warn("Failed to delete opportunity vectors:", indexError);
		}

		await getPusher().trigger("private-global", "opportunity_update", {
			action: "opportunity_deleted",
			opportunity,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/opportunities");
		return {
			success: true,
			message: "Opportunity deleted successfully",
			data: opportunity,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete opportunity",
		};
	}
}

export async function bulkDeleteOpportunitiesAction(ids: string[]): Promise<ActionResult> {
	try {
		await requirePermission("customers", "delete");

		const result = await opportunityService.deleteMultipleOpportunities(ids);

		await getPusher().trigger("private-global", "opportunity_update", {
			action: "opportunities_bulk_deleted",
			ids,
			count: result.count,
			timestamp: new Date().toISOString(),
		});

		revalidatePath("/opportunities");
		return {
			success: true,
			message: `${result.count} opportunities deleted successfully`,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete opportunities",
		};
	}
}
