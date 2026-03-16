/**
 * Interaction Service - Business Logic
 */

import { SITE_CONFIG } from "@/lib";

import * as interactionRepository from "../repositories/interaction-repository";
import type { CreateInteractionInput, InteractionListParams, UpdateInteractionInput } from "../types/interaction.types";

// ============================================================================
// INTERACTION SERVICE
// ============================================================================

export async function getAllInteractions(params?: InteractionListParams) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, customerId, contactId, type } = params || {};

	const result = await interactionRepository.getAllInteractions({
		page,
		limit: pageSize,
		search,
		customerId,
		contactId,
		type,
	});

	return {
		interactions: result.interactions,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

export async function getInteractionById(id: string) {
	const interaction = await interactionRepository.getInteractionById(id);
	if (!interaction) throw new Error("Interaction not found");
	return interaction;
}

export async function createInteraction(data: CreateInteractionInput) {
	// Validate required fields
	if (!data.subject?.trim()) throw new Error("Subject is required");
	if (!data.type) throw new Error("Type is required");
	if (!data.date) throw new Error("Date is required");

	return interactionRepository.createInteraction(data);
}

export async function updateInteraction(id: string, data: UpdateInteractionInput) {
	// Verify interaction exists
	await getInteractionById(id);

	return interactionRepository.updateInteraction(id, data);
}

export async function deleteInteraction(id: string) {
	// Verify interaction exists
	await getInteractionById(id);

	return interactionRepository.deleteInteraction(id);
}

export async function deleteMultipleInteractions(ids: string[]) {
	if (ids.length === 0) throw new Error("No interaction IDs provided");

	return interactionRepository.bulkDeleteInteractions(ids);
}
