"use server";

import { crossFeatureSearch, getAccessibleModules } from "@/lib/features/vector-search";
import { logSearchResult } from "@/lib/features/vector-search/services/cross-feature-service";
import type { RAGResponse } from "@/lib/features/vector-search/types";
import { getLogger } from "@/lib/utils/logger";

const log = getLogger("search-actions");

/**
 * Server action for global RAG search
 * Respects RBAC permissions automatically
 */
export async function searchAcrossModules(query: string, modules?: string[]): Promise<RAGResponse> {
	try {
		const startTime = Date.now();

		// Get accessible modules if not specified
		let searchModules = modules;
		if (!searchModules) {
			searchModules = await getAccessibleModules();
		}

		if (!searchModules || searchModules.length === 0) {
			return {
				success: false,
				message: "No accessible modules to search",
			};
		}

		log.info("Cross-module search", {
			query: query.substring(0, 50),
			modules: searchModules,
		});

		const result = await crossFeatureSearch(query, {
			modules: searchModules,
			topK: 5,
			minSimilarity: 0.6,
		});

		const processingTime = Date.now() - startTime;

		// Log the search for analytics
		if (result.success) {
			await logSearchResult(query, result.answer || "", result.sources?.length || 0, processingTime);
		}

		return {
			...result,
			metadata: {
				...result.metadata,
				processingTime,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		log.error("Search failed", { error: message });
		return {
			success: false,
			message: `Search failed: ${message}`,
		};
	}
}

/**
 * Submit feedback on a search result
 */
export async function submitSearchFeedback(query: string, answer: string, helpful: boolean): Promise<{ success: boolean }> {
	try {
		log.info("Search feedback received", {
			query: query.substring(0, 50),
			answer: answer.substring(0, 50),
			helpful,
		});

		// Can be extended to store feedback in database
		// for improving search quality over time

		return { success: true };
	} catch (error) {
		log.error("Failed to submit feedback", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return { success: false };
	}
}
