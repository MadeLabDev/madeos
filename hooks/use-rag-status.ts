"use client";

import { useEffect, useState } from "react";

import { getRAGStatusAction } from "@/lib/features/settings/actions/settings-actions";

/**
 * Client-safe hook to check RAG status
 * Uses server action to avoid importing server-only modules
 */
export function useRAGStatus() {
	const [ragEnabled, setRagEnabled] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkRAGStatus();
	}, []);

	async function checkRAGStatus() {
		try {
			const result = await getRAGStatusAction();
			setRagEnabled(result.data?.enabled ?? false);
		} catch (error) {
			console.error("Failed to check RAG status:", error);
			setRagEnabled(false);
		} finally {
			setLoading(false);
		}
	}

	return { ragEnabled, loading };
}
