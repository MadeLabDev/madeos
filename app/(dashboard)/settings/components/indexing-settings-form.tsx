"use client";

import { useEffect, useState } from "react";

import { AlertCircle, CheckCircle2, Database, FileText, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { batchIndexDesignProjectsAction, batchIndexKnowledgeAction, batchIndexMarketingCampaignsAction, batchIndexTasksAction, batchIndexTestReportsAction, batchIndexTrainingAction, getIndexingStatsAction } from "@/lib/features/settings/actions/settings-actions";

interface IndexingSettingsFormProps {
	onSuccess?: () => void;
	onLoadingChange?: (loading: boolean) => void;
	hideButtons?: boolean;
}

interface IndexingStats {
	knowledgeArticles: number;
	indexedVectors: number;
	lastIndexedAt?: Date;
	indexingProgress?: {
		current: number;
		total: number;
		status: string;
	};
}

export function IndexingSettingsForm({ onSuccess, onLoadingChange, hideButtons }: IndexingSettingsFormProps) {
	const [loading] = useState(false);
	const [indexing, setIndexing] = useState(false);
	const [indexingTasks, setIndexingTasks] = useState(false);
	const [indexingTraining, setIndexingTraining] = useState(false);
	const [indexingTestReports, setIndexingTestReports] = useState(false);
	const [indexingDesignProjects, setIndexingDesignProjects] = useState(false);
	const [indexingMarketingCampaigns, setIndexingMarketingCampaigns] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [stats, setStats] = useState<IndexingStats | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	// Load indexing stats on mount
	useEffect(() => {
		loadStats();
	}, []);

	// Notify parent of loading state
	useEffect(() => {
		onLoadingChange?.(loading || indexing || indexingTasks || indexingTraining || indexingTestReports || indexingDesignProjects || indexingMarketingCampaigns);
	}, [loading, indexing, indexingTasks, indexingTraining, indexingTestReports, indexingDesignProjects, indexingMarketingCampaigns, onLoadingChange]);

	async function loadStats() {
		try {
			setRefreshing(true);
			setError(null);

			const result = await getIndexingStatsAction();

			if (result.success && result.data) {
				setStats(result.data);
			} else {
				setError(result.message);
				// Set default values if failed
				setStats({
					knowledgeArticles: 0,
					indexedVectors: 0,
					lastIndexedAt: undefined,
				});
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
			// Set default values on error
			setStats({
				knowledgeArticles: 0,
				indexedVectors: 0,
				lastIndexedAt: undefined,
			});
		} finally {
			setRefreshing(false);
		}
	}

	async function handleBatchIndex() {
		setIndexing(true);
		setError(null);

		try {
			const result = await batchIndexKnowledgeAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexing(false);
		}
	}

	async function handleBatchIndexTasks() {
		setIndexingTasks(true);
		setError(null);

		try {
			const result = await batchIndexTasksAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexingTasks(false);
		}
	}

	async function handleBatchIndexTraining() {
		setIndexingTraining(true);
		setError(null);

		try {
			const result = await batchIndexTrainingAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexingTraining(false);
		}
	}

	async function handleBatchIndexTestReports() {
		setIndexingTestReports(true);
		setError(null);

		try {
			const result = await batchIndexTestReportsAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexingTestReports(false);
		}
	}

	async function handleBatchIndexDesignProjects() {
		setIndexingDesignProjects(true);
		setError(null);

		try {
			const result = await batchIndexDesignProjectsAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexingDesignProjects(false);
		}
	}

	async function handleBatchIndexMarketingCampaigns() {
		setIndexingMarketingCampaigns(true);
		setError(null);

		try {
			const result = await batchIndexMarketingCampaignsAction();

			if (result.success && result.data) {
				toast.success(result.message);
				// Reload stats from database to get accurate counts
				await loadStats();
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
			setIndexingMarketingCampaigns(false);
		}
	}

	return (
		<div className="space-y-6">
			{/* Overview Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Knowledge Articles</CardTitle>
						<FileText className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{refreshing ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.knowledgeArticles || 0}</div>
						<p className="text-muted-foreground text-xs">Total articles in knowledge base</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Indexed Vectors</CardTitle>
						<Database className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{refreshing ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.indexedVectors || 0}</div>
						<p className="text-muted-foreground text-xs">Searchable vector embeddings</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Index Status</CardTitle>
						<Search className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							{(stats?.knowledgeArticles || 0) === (stats?.indexedVectors || 0) && (stats?.knowledgeArticles || 0) > 0 ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
							<Badge variant={(stats?.knowledgeArticles || 0) === (stats?.indexedVectors || 0) && (stats?.knowledgeArticles || 0) > 0 ? "default" : "secondary"}>{(stats?.knowledgeArticles || 0) === (stats?.indexedVectors || 0) && (stats?.knowledgeArticles || 0) > 0 ? "Complete" : "Needs Update"}</Badge>
						</div>
						<p className="text-muted-foreground mt-1 text-xs">{stats?.lastIndexedAt ? `Last indexed: ${stats.lastIndexedAt.toLocaleDateString()}` : "Never indexed"}</p>
					</CardContent>
				</Card>
			</div>

			{/* Indexing Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						Data Indexing
					</CardTitle>
					<CardDescription>Index your data for semantic search and AI capabilities. This process converts text content into searchable vector embeddings.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Knowledge Articles Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Knowledge Base</h3>
								<p className="text-muted-foreground text-sm">Index all knowledge articles for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndex}
								disabled={loading || indexing}
								variant="outline"
								size="sm">
								{indexing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexing ? "Indexing..." : "Index Knowledge"}
							</Button>
						</div>

						{/* Progress indicator during indexing */}
						{indexing && stats?.indexingProgress && (
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Progress</span>
									<span>
										{stats.indexingProgress.current} / {stats.indexingProgress.total}
									</span>
								</div>
								<Progress
									value={(stats.indexingProgress.current / stats.indexingProgress.total) * 100}
									className="w-full"
								/>
								<p className="text-muted-foreground text-xs">{stats.indexingProgress.status}</p>
							</div>
						)}
					</div>

					{/* Tasks Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Tasks</h3>
								<p className="text-muted-foreground text-sm">Index all tasks for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndexTasks}
								disabled={loading || indexingTasks}
								variant="outline"
								size="sm">
								{indexingTasks && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexingTasks ? "Indexing..." : "Index Tasks"}
							</Button>
						</div>
					</div>

					{/* Training Sessions Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Training Sessions</h3>
								<p className="text-muted-foreground text-sm">Index all training sessions for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndexTraining}
								disabled={loading || indexingTraining}
								variant="outline"
								size="sm">
								{indexingTraining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexingTraining ? "Indexing..." : "Index Training"}
							</Button>
						</div>
					</div>

					{/* Test Reports Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Test Reports</h3>
								<p className="text-muted-foreground text-sm">Index all test reports for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndexTestReports}
								disabled={loading || indexingTestReports}
								variant="outline"
								size="sm">
								{indexingTestReports && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexingTestReports ? "Indexing..." : "Index Test Reports"}
							</Button>
						</div>
					</div>

					{/* Design Projects Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Design Projects</h3>
								<p className="text-muted-foreground text-sm">Index all design projects for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndexDesignProjects}
								disabled={loading || indexingDesignProjects}
								variant="outline"
								size="sm">
								{indexingDesignProjects && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexingDesignProjects ? "Indexing..." : "Index Design Projects"}
							</Button>
						</div>
					</div>

					{/* Marketing Campaigns Indexing */}
					<div className="rounded-lg border p-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<h3 className="font-semibold">Marketing Campaigns</h3>
								<p className="text-muted-foreground text-sm">Index all marketing campaigns for semantic search</p>
							</div>
							<Button
								onClick={handleBatchIndexMarketingCampaigns}
								disabled={loading || indexingMarketingCampaigns}
								variant="outline"
								size="sm">
								{indexingMarketingCampaigns && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{indexingMarketingCampaigns ? "Indexing..." : "Index Marketing Campaigns"}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Message */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Action Buttons */}
			{!hideButtons && (
				<div className="flex items-center justify-between pt-4">
					<div className="flex items-center gap-3">
						<Button
							onClick={loadStats}
							disabled={loading || refreshing}
							variant="outline"
							size="sm">
							{refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh Stats
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
