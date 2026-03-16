/**
 * RAG Feature Flag Helper
 *
 * Central place to check if RAG is enabled.
 * Prevents AI features from running unless explicitly enabled.
 *
 * Usage:
 *   const isRagEnabled = await isRagEnabled();
 *   if (isRagEnabled) {
 *     // Run RAG queries
 *   }
 */

import { prisma } from "@/lib/prisma";

let cachedRagEnabled: boolean | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if RAG is enabled in settings
 * Results are cached for 5 minutes to avoid database hits
 */
export async function isRagEnabled(): Promise<boolean> {
	const now = Date.now();

	// Return cached value if fresh
	if (cachedRagEnabled !== null && now - cacheTime < CACHE_DURATION) {
		return cachedRagEnabled;
	}

	try {
		const setting = await prisma.settings.findUnique({
			where: { key: "rag_enabled" },
		});

		const enabled = setting?.value === "true";
		cachedRagEnabled = enabled;
		cacheTime = now;

		return enabled;
	} catch (error) {
		console.error("Failed to check RAG setting:", error);
		// Fail safe: return false (RAG disabled) on error
		return false;
	}
}

/**
 * Clear RAG cache (call after updating setting)
 */
export function clearRagCache(): void {
	cachedRagEnabled = null;
	cacheTime = 0;
}

/**
 * Safely enable RAG in settings
 */
export async function enableRAG(): Promise<void> {
	await prisma.settings.upsert({
		where: { key: "rag_enabled" },
		create: {
			key: "rag_enabled",
			value: "true",
			description: "Enable/disable RAG (vector search + LLM) features",
		},
		update: { value: "true" },
	});

	clearRagCache();
}

/**
 * Safely disable RAG in settings
 */
export async function disableRAG(): Promise<void> {
	await prisma.settings.upsert({
		where: { key: "rag_enabled" },
		create: {
			key: "rag_enabled",
			value: "false",
			description: "Enable/disable RAG (vector search + LLM) features",
		},
		update: { value: "false" },
	});

	clearRagCache();
}
