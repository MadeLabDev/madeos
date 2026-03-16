"use client";

import { useEffect, useState } from "react";

import { getAIAssistantStatusAction } from "@/lib/features/settings/actions/settings-actions";

/**
 * Client-safe hook to check AI Assistant status
 * Uses server action to avoid importing server-only modules
 */
export function useAIAssistantStatus() {
	const [aiAssistantEnabled, setAiAssistantEnabled] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkAIAssistantStatus();
	}, []);

	async function checkAIAssistantStatus() {
		try {
			const result = await getAIAssistantStatusAction();
			setAiAssistantEnabled(result.data?.enabled ?? false);
		} catch (error) {
			console.error("Failed to check AI Assistant status:", error);
			setAiAssistantEnabled(false);
		} finally {
			setLoading(false);
		}
	}

	return { aiAssistantEnabled, loading };
}