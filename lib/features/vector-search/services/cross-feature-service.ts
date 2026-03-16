"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permissions";
import { getLogger } from "@/lib/utils/logger";

import { ragQuery } from "./rag-service";
const logger = getLogger("cross-feature-service");
import type { CrossFeatureSearchOptions, RAGRequest, RAGResponse } from "@/lib/features/vector-search/types";

/**
 * Cross-Feature Search Service
 * High-level orchestration for searching across all modules
 * Handles permission checking and module availability
 */

const AVAILABLE_MODULES = ["knowledge", "contacts", "opportunities", "events", "interactions"];

/**
 * Search across all accessible modules
 */
export async function crossFeatureSearch(query: string, options: CrossFeatureSearchOptions = {}): Promise<RAGResponse> {
	try {
		// Get current user and permissions
		const session = await auth();
		if (!session?.user) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		logger.debug("Cross-feature search starting", {
			userId: session.user.id,
			query: query.substring(0, 50),
			modules: options.modules,
		});

		// Determine which modules user can access
		const accessibleModules: string[] = [];

		for (const moduleName of AVAILABLE_MODULES) {
			try {
				const { allowed } = await checkPermission(moduleName, "read");
				if (allowed) {
					accessibleModules.push(moduleName);
				}
			} catch {
				// Permission check failed, skip module
			}
		}

		if (accessibleModules.length === 0) {
			return {
				success: false,
				message: "You don't have access to any searchable modules",
			};
		}

		// Filter to requested modules if specified
		const modulesToSearch = options.modules ? AVAILABLE_MODULES.filter((m) => accessibleModules.includes(m) && options.modules!.includes(m)) : accessibleModules;

		if (modulesToSearch.length === 0) {
			return {
				success: false,
				message: "Requested modules are not accessible or not available for search",
			};
		}

		logger.debug("Modules determined", {
			accessible: accessibleModules,
			searching: modulesToSearch,
		});

		// Build RAG request
		const ragRequest: RAGRequest = {
			query,
			modules: modulesToSearch,
			topK: options.topK || 5,
			minSimilarity: options.minSimilarity || 0.1, // Lower threshold for better results
		};

		// Execute RAG query
		const result = await ragQuery(ragRequest);

		if (result.success) {
			logger.info("Cross-feature search completed", {
				answer: result.answer?.substring(0, 50),
				sourceCount: result.sources?.length || 0,
			});
		} else {
			logger.warn("Cross-feature search failed", {
				message: result.message,
			});
		}

		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error("Cross-feature search error", { error: message });
		return {
			success: false,
			message: `Search failed: ${message}`,
		};
	}
}

/**
 * Get available modules for current user
 */
export async function getAccessibleModules(): Promise<string[]> {
	try {
		const session = await auth();
		if (!session?.user) {
			return [];
		}

		const accessible: string[] = [];

		for (const moduleName of AVAILABLE_MODULES) {
			try {
				const { allowed } = await checkPermission(moduleName, "read");
				if (allowed) {
					accessible.push(moduleName);
				}
			} catch {
				// Skip inaccessible module
			}
		}

		return accessible;
	} catch (error) {
		logger.error("Failed to get accessible modules", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
		return [];
	}
}

/**
 * Get search suggestions based on frequently asked topics
 */
export async function getSearchSuggestions(): Promise<string[]> {
	// Placeholder - can be extended to analyze search logs
	return ["What are our latest opportunities?", "Tell me about recent contacts", "What events are coming up?", "Find training materials", "Search for knowledge articles"];
}

/**
 * Save search result for analytics/improvement
 */
export async function logSearchResult(query: string, _answer: string, sourceCount: number, responseTime: number, feedback?: "helpful" | "not_helpful" | null): Promise<void> {
	try {
		const session = await auth();

		// Log to VectorSearchLog for analytics
		// This can be extended to analyze patterns and improve results
		logger.info("Search logged", {
			queryLength: query.length,
			sourceCount,
			responseTime,
			feedback,
			userId: session?.user?.id,
		});
	} catch (error) {
		logger.error("Failed to log search result", {
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
