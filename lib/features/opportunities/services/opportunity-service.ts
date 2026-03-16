/**
 * Opportunity Service - Business Logic
 */

import { SITE_CONFIG } from "@/lib";
import * as opportunityRepository from "@/lib/features/opportunities/repositories/opportunity-repository";
import type { CreateOpportunityInput, OpportunityListParams, UpdateOpportunityInput } from "@/lib/features/opportunities/types/opportunity.types";

// ============================================================================
// OPPORTUNITY SERVICE
// ============================================================================

export async function getAllOpportunities(params?: OpportunityListParams) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, customerId, stage } = params || {};

	const result = await opportunityRepository.getAllOpportunities({
		page,
		limit: pageSize,
		search,
		customerId,
		stage,
	});

	return {
		opportunities: result.opportunities,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

export async function getOpportunityById(id: string) {
	const opportunity = await opportunityRepository.getOpportunityById(id);
	if (!opportunity) throw new Error("Opportunity not found");
	return opportunity;
}

export async function createOpportunity(data: CreateOpportunityInput) {
	// Validate required fields
	if (!data.title?.trim()) throw new Error("Title is required");
	if (!data.customerId?.trim()) throw new Error("Customer ID is required");
	if (!data.ownerId?.trim()) throw new Error("Owner ID is required");

	return opportunityRepository.createOpportunity(data);
}

export async function updateOpportunity(id: string, data: UpdateOpportunityInput) {
	// Verify opportunity exists
	await getOpportunityById(id);

	return opportunityRepository.updateOpportunity(id, data);
}

export async function deleteOpportunity(id: string) {
	// Verify opportunity exists
	await getOpportunityById(id);

	return opportunityRepository.deleteOpportunity(id);
}

export async function deleteMultipleOpportunities(ids: string[]) {
	if (ids.length === 0) throw new Error("No opportunity IDs provided");

	return opportunityRepository.bulkDeleteOpportunities(ids);
}
