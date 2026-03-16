/**
 * RAG Toggle Component
 *
 * Simple on/off switch for RAG feature
 * Location: Add to admin dashboard or settings page
 * Uses: Settings server actions with permission checks
 *
 * Usage:
 *   import { RAGToggle } from "@/components/admin/rag-toggle";
 *
 *   <RAGToggle />
 */

"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getRAGStatusAction, toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

export function RAGToggle() {
	const [enabled, setEnabled] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check initial status
	useEffect(() => {
		checkStatus();
	}, []);

	async function checkStatus() {
		try {
			const result = await getRAGStatusAction();

			if (result.success && result.data) {
				setEnabled(result.data.enabled);
				setError(null);
			} else {
				setError(result.message || "Failed to fetch status");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	}

	async function toggle() {
		if (enabled === null) return;

		setLoading(true);
		setError(null);

		try {
			const result = await toggleRAGAction(!enabled);

			if (result.success) {
				setEnabled(!enabled);
				toast.success(result.message);
			} else {
				toast.error(result.message);
				setError(result.message);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(message);
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	if (enabled === null) {
		return (
			<div className="flex items-center gap-2">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span className="text-muted-foreground text-sm">Loading...</span>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{/* Status Display */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold">RAG Feature</h3>
					<p className="text-muted-foreground text-sm">{enabled ? "🟢 Enabled - Vector search & LLM active" : "🔴 Disabled - Search-only mode"}</p>
				</div>

				{/* Toggle Button */}
				<Button
					onClick={toggle}
					disabled={loading}
					variant={enabled ? "destructive" : "default"}
					size="sm">
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{enabled ? "Disable RAG" : "Enable RAG"}
				</Button>
			</div>

			{/* Error Display */}
			{error && (
				<div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
					<AlertCircle className="h-4 w-4 flex-shrink-0" />
					<span>{error}</span>
				</div>
			)}

			{/* Info Box */}
			<div className="rounded-md bg-blue-50 p-3 text-sm dark:bg-blue-950">
				<div className="space-y-1">
					<p className="font-medium">What this does:</p>
					<ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-xs">
						<li>
							<strong>Enabled:</strong> Uses vector search + LLM (OpenAI/Gemini/Claude)
						</li>
						<li>
							<strong>Disabled:</strong> Falls back to keyword search only
						</li>
						<li>Can be toggled anytime without losing data</li>
						<li>Requires valid API key (OpenAI, Gemini, or Claude)</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
