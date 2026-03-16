"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Bot, CheckCircle2, ChevronDown, Loader2, MessageCircle, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { getAIAssistantStatusAction, getRAGStatusAction, toggleAIAssistantAction, toggleRAGAction } from "@/lib/features/settings/actions/settings-actions";

interface RAGSettingsFormProps {
	onSuccess?: () => void;
	onLoadingChange?: (loading: boolean) => void;
	hideButtons?: boolean;
}

export function RAGSettingsForm({ onSuccess, onLoadingChange, hideButtons }: RAGSettingsFormProps) {
	const [ragEnabled, setRagEnabled] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(false);
	const [checking, setChecking] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [aiAssistantEnabled, setAiAssistantEnabled] = useState<boolean | null>(null);
	const [showDisableDialog, setShowDisableDialog] = useState(false);
	const [aiAssistantExpanded, setAiAssistantExpanded] = useState(false);

	// Load RAG status on mount
	useEffect(() => {
		checkStatus();
	}, []);

	// Notify parent of loading state
	useEffect(() => {
		onLoadingChange?.(loading);
	}, [loading, onLoadingChange]);

	async function checkStatus() {
		try {
			setChecking(true);
			setError(null);
			const [ragResult, aiResult] = await Promise.all([getRAGStatusAction(), getAIAssistantStatusAction()]);

			if (ragResult.success && ragResult.data) {
				setRagEnabled(ragResult.data.enabled);
			} else {
				setError(ragResult.message || "Failed to get RAG status");
			}

			if (aiResult.success && aiResult.data) {
				setAiAssistantEnabled(aiResult.data.enabled);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
		} finally {
			setChecking(false);
		}
	}

	async function handleToggle() {
		if (ragEnabled === null) return;

		if (ragEnabled) {
			// If currently enabled, show confirmation dialog for disable
			setShowDisableDialog(true);
		} else {
			// If currently disabled, enable directly
			await handleEnableRAG();
		}
	}

	async function handleEnableRAG() {
		setLoading(true);
		setError(null);

		try {
			const result = await toggleRAGAction(true);

			if (result.success) {
				setRagEnabled(true);
				toast.success(result.message);
				onSuccess?.();
			} else {
				setError(result.message);
				toast.error(result.message);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleDisableRAG() {
		setLoading(true);
		setError(null);
		setShowDisableDialog(false);

		try {
			const result = await toggleRAGAction(false);

			if (result.success) {
				setRagEnabled(false);
				toast.success(result.message);
				onSuccess?.();
			} else {
				setError(result.message);
				toast.error(result.message);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	async function handleToggleAIAssistant() {
		if (aiAssistantEnabled === null) return;

		setLoading(true);
		setError(null);

		try {
			const result = await toggleAIAssistantAction(!aiAssistantEnabled);

			if (result.success) {
				setAiAssistantEnabled(!aiAssistantEnabled);
				toast.success(result.message);
				onSuccess?.();
			} else {
				setError(result.message);
				toast.error(result.message);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}

	if (checking) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5" />
						RAG (Semantic Search + LLM)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-muted-foreground text-sm">Loading RAG status...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							RAG (Semantic Search + LLM)
						</CardTitle>
						<CardDescription>Enable vector search and large language model capabilities</CardDescription>
					</div>
					<Badge
						variant={ragEnabled ? "default" : "secondary"}
						className="ml-2">
						{ragEnabled ? "Enabled" : "Disabled"}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Status Card */}
				<div className="rounded-lg border p-4">
					<h3 className="mb-3 font-semibold">Current Status</h3>
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Vector Search:</span>
							<span className={ragEnabled ? "font-medium" : "text-muted-foreground"}>{ragEnabled ? "✓ Active" : "✗ Inactive"}</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">LLM Generation:</span>
							<span className={ragEnabled ? "font-medium" : "text-muted-foreground"}>{ragEnabled ? "✓ Active" : "✗ Inactive"}</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Semantic Search:</span>
							<span className={ragEnabled ? "font-medium" : "text-muted-foreground"}>{ragEnabled ? "✓ Active" : "✗ Inactive"}</span>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="rounded-lg border p-4">
					<h3 className="mb-3 font-semibold">When Enabled</h3>
					<ul className="text-muted-foreground space-y-2 text-sm">
						<li className="flex items-start gap-2">
							<CheckCircle2 className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
							<span>Semantic search on knowledge base using embeddings</span>
						</li>
						<li className="flex items-start gap-2">
							<CheckCircle2 className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
							<span>Generate answers using LLM (OpenAI, Gemini, or Claude)</span>
						</li>
						<li className="flex items-start gap-2">
							<CheckCircle2 className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
							<span>Find similar resources and documents automatically</span>
						</li>
						<li className="flex items-start gap-2">
							<CheckCircle2 className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
							<span>Cost optimization with embedding caching</span>
						</li>
					</ul>
				</div>

				{/* AI Assistant Section */}
				{ragEnabled && (
					<div className="rounded-lg border">
						<Collapsible
							open={aiAssistantExpanded}
							onOpenChange={setAiAssistantExpanded}>
							<CollapsibleTrigger asChild>
								<div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4 transition-colors">
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
											<Bot className="text-primary h-5 w-5" />
										</div>
										<div>
											<h3 className="text-left font-semibold">AI Assistant</h3>
											<p className="text-muted-foreground text-left text-sm">Global chat widget powered by AI</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge
											variant={aiAssistantEnabled ? "default" : "secondary"}
											className="text-xs">
											{aiAssistantEnabled ? "Active" : "Inactive"}
										</Badge>
										<ChevronDown className={`h-4 w-4 transition-transform ${aiAssistantExpanded ? "rotate-180" : ""}`} />
									</div>
								</div>
							</CollapsibleTrigger>

							<CollapsibleContent>
								<div className="border-t px-4 pb-4">
									<div className="space-y-4 pt-4">
										{/* Description */}
										<div className="bg-muted/30 rounded-lg p-3">
											<p className="text-muted-foreground text-sm">The AI Assistant provides intelligent conversation capabilities across your entire system. It can answer questions, search knowledge base, and assist with various tasks.</p>
										</div>

										{/* Toggle Control */}
										<div className="bg-background flex items-center justify-between rounded-lg border p-3">
											<div className="flex items-center gap-3">
												<Switch
													checked={aiAssistantEnabled || false}
													onCheckedChange={handleToggleAIAssistant}
													disabled={loading || aiAssistantEnabled === null}
												/>
												<div>
													<p className="text-sm font-medium">Enable AI Assistant</p>
													<p className="text-muted-foreground text-xs">Show chat widget in bottom-right corner</p>
												</div>
											</div>
											{loading && <Loader2 className="h-4 w-4 animate-spin" />}
										</div>

										{/* Features */}
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											<div className="bg-background flex items-start gap-3 rounded-lg border p-3">
												<MessageCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
												<div>
													<p className="text-sm font-medium">Smart Conversations</p>
													<p className="text-muted-foreground text-xs">Natural language chat with context awareness</p>
												</div>
											</div>

											<div className="bg-background flex items-start gap-3 rounded-lg border p-3">
												<Sparkles className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
												<div>
													<p className="text-sm font-medium">Knowledge Search</p>
													<p className="text-muted-foreground text-xs">Search and retrieve information from your knowledge base</p>
												</div>
											</div>
										</div>

										{/* Preview */}
										<div className="from-primary/5 to-primary/10 border-primary/20 rounded-lg border-2 border-dashed bg-gradient-to-br p-4">
											<div className="mb-2 flex items-center gap-3">
												<div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
												<p className="text-primary text-sm font-medium">AI Assistant Preview</p>
											</div>
											<div className="bg-background rounded-lg p-3 shadow-sm">
												<div className="flex items-start gap-2">
													<div className="bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
														<Bot className="text-primary-foreground h-3 w-3" />
													</div>
													<div className="flex-1">
														<p className="text-muted-foreground mb-1 text-xs">AI Assistant</p>
														<div className="bg-muted rounded-lg p-2">
															<p className="text-xs">Hi! I'm your AI assistant. How can I help you today?</p>
														</div>
													</div>
												</div>
											</div>
											<p className="text-muted-foreground mt-2 text-center text-xs">Widget appears in bottom-right corner when enabled</p>
										</div>
									</div>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>
				)}

				{/* Error Message */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Action Button */}
				{!hideButtons && (
					<div className="flex items-center justify-between pt-4">
						<div className="flex items-center gap-3">
							<Switch
								checked={ragEnabled || false}
								onCheckedChange={handleToggle}
								disabled={loading || ragEnabled === null}
							/>
							<div>
								<p className="text-sm font-medium">Enable RAG</p>
								<p className="text-muted-foreground text-xs">Semantic search and LLM capabilities</p>
							</div>
						</div>
						<Button
							onClick={checkStatus}
							disabled={loading}
							variant="outline"
							size="sm">
							Refresh
						</Button>
					</div>
				)}

				{/* Disable Confirmation Dialog */}
				<AlertDialog
					open={showDisableDialog}
					onOpenChange={setShowDisableDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Disable RAG?</AlertDialogTitle>
							<AlertDialogDescription>This will disable semantic search and LLM capabilities across the entire system. All vector search and AI features will be unavailable until re-enabled. Are you sure you want to continue?</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDisableRAG}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Disable RAG
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardContent>
		</Card>
	);
}
