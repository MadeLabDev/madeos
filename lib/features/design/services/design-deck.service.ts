/**
 * DesignDeck Service
 * Business logic for DesignDecks
 */

import type { ActionResult } from "@/lib/types";

import { DesignDeckRepository } from "../repositories";
import type { CreateDesignDeckInput, DesignDeckFilters, DesignDeckWithRelations, UpdateDesignDeckInput } from "../types";

export class DesignDeckService {
	/**
	 * Get all decks with filtering
	 */
	static async getDesignDecks(filters: DesignDeckFilters = {}, options: { skip?: number; take?: number } = {}): Promise<DesignDeckWithRelations[]> {
		try {
			return await DesignDeckRepository.findMany(filters, options);
		} catch (error) {
			throw new Error(`Failed to fetch decks: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get deck by ID
	 */
	static async getDesignDeckById(id: string): Promise<DesignDeckWithRelations | null> {
		try {
			return await DesignDeckRepository.findById(id);
		} catch (error) {
			throw new Error(`Failed to fetch deck: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Get deck by project ID
	 */
	static async getDesignDeckByProjectId(projectId: string): Promise<DesignDeckWithRelations | null> {
		try {
			return await DesignDeckRepository.findByProjectId(projectId);
		} catch (error) {
			throw new Error(`Failed to fetch deck: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Create new deck
	 */
	static async createDesignDeck(input: CreateDesignDeckInput & { createdBy: string }): Promise<ActionResult<DesignDeckWithRelations>> {
		try {
			if (!input.title?.trim()) {
				return {
					success: false,
					message: "Deck title is required",
				};
			}

			if (!input.designProjectId?.trim()) {
				return {
					success: false,
					message: "Design project ID is required",
				};
			}

			const deck = await DesignDeckRepository.create(input);

			return {
				success: true,
				message: "Design deck created",
				data: deck,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to create deck",
			};
		}
	}

	/**
	 * Update deck
	 */
	static async updateDesignDeck(id: string, input: UpdateDesignDeckInput & { updatedBy: string }): Promise<ActionResult<DesignDeckWithRelations>> {
		try {
			const existing = await DesignDeckRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Deck not found",
				};
			}

			const deck = await DesignDeckRepository.update(id, input);

			return {
				success: true,
				message: "Design deck updated",
				data: deck,
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to update deck",
			};
		}
	}

	/**
	 * Delete deck
	 */
	static async deleteDesignDeck(id: string): Promise<ActionResult<void>> {
		try {
			const existing = await DesignDeckRepository.findById(id);
			if (!existing) {
				return {
					success: false,
					message: "Deck not found",
				};
			}

			await DesignDeckRepository.delete(id);

			return {
				success: true,
				message: "Design deck deleted",
			};
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to delete deck",
			};
		}
	}
}
