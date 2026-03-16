/**
 * AI Server Actions
 *
 * Server actions for AI-related functionality
 */

"use server";

import { isRagEnabled } from "./rag-feature-flag";

/**
 * Server action to check RAG status (safe for client components)
 */
export async function checkRagStatusAction(): Promise<boolean> {
	try {
		return await isRagEnabled();
	} catch (error) {
		console.error("Error checking RAG status:", error);
		return false;
	}
}
