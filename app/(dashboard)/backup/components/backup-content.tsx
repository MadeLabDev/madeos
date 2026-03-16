"use client";

import { useCallback, useEffect, useState } from "react";

import { CheckCircle, Clock, Database, ExternalLink, HardDrive, RefreshCw, Save, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BackupRecord, BackupStats } from "@/lib/features/backup";
import { createManualBackupAction, getBackupStatsAction, listBackupsAction } from "@/lib/features/backup";

interface BackupContentProps {
	initialStats: BackupStats;
}

export function BackupContent({ initialStats }: BackupContentProps) {
	const [stats, setStats] = useState<BackupStats>(initialStats);
	const [backups, setBackups] = useState<BackupRecord[]>([]);
	const [isCreatingBackup, setIsCreatingBackup] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingBackups, setIsLoadingBackups] = useState(false);

	const handleCreateBackup = async () => {
		setIsCreatingBackup(true);
		try {
			const result = await createManualBackupAction();

			if (result.success) {
				toast.success("Backup created successfully", {
					description: result.message,
				});
				// Refresh stats and backups
				await loadStats();
				await loadBackups();
			} else {
				toast.error("Backup failed", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Backup failed", {
				description: "An unexpected error occurred",
			});
		} finally {
			setIsCreatingBackup(false);
		}
	};

	const loadStats = useCallback(async () => {
		setIsRefreshing(true);
		try {
			const result = await getBackupStatsAction();
			if (result.success && result.data) {
				setStats(result.data);
			}
		} catch (error) {
			console.error("Error loading backup stats:", error);
			toast.error("Failed to load backup statistics");
		} finally {
			setIsRefreshing(false);
		}
	}, []);

	const loadBackups = useCallback(async () => {
		setIsLoadingBackups(true);
		try {
			const result = await listBackupsAction();
			if (result.success && result.data) {
				setBackups(result.data);
			}
		} catch (error) {
			console.error("Error loading backup history:", error);
			toast.error("Failed to load backup history");
		} finally {
			setIsLoadingBackups(false);
		}
	}, []);

	// Load backups on component mount
	useEffect(() => {
		loadBackups();
	}, [loadBackups]);

	const formatBytes = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const formatDate = (date?: Date) => {
		if (!date) return "Never";
		return new Date(date).toLocaleString();
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "FAILED":
				return <XCircle className="h-4 w-4 text-red-600" />;
			case "IN_PROGRESS":
				return <Clock className="h-4 w-4 text-yellow-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-600" />;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return (
					<Badge
						variant="default"
						className="bg-green-100 text-green-800">
						Completed
					</Badge>
				);
			case "FAILED":
				return <Badge variant="destructive">Failed</Badge>;
			case "IN_PROGRESS":
				return (
					<Badge
						variant="secondary"
						className="bg-yellow-100 text-yellow-800">
						In Progress
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Backups</CardTitle>
						<Database className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalBackups}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Successful</CardTitle>
						<Database className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{stats.successfulBackups}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Failed</CardTitle>
						<Database className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.failedBackups}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Size</CardTitle>
						<HardDrive className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
					</CardContent>
				</Card>
			</div>

			{/* Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Backup Actions</CardTitle>
					<CardDescription>Create manual backups or manage existing backup files</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-sm font-medium">Create Manual Backup</p>
							<p className="text-muted-foreground text-sm">Generate a new database backup and upload to R2 storage</p>
						</div>
						<Button
							onClick={handleCreateBackup}
							disabled={isCreatingBackup}
							className="shrink-0">
							{isCreatingBackup ? (
								<>
									<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Create Backup
								</>
							)}
						</Button>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-sm font-medium">Last Backup</p>
							<p className="text-muted-foreground text-sm">{formatDate(stats.lastBackupDate)}</p>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								loadStats();
								loadBackups();
							}}
							disabled={isRefreshing || isLoadingBackups}
							size="sm">
							{isRefreshing || isLoadingBackups ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Backup History */}
			<Card>
				<CardHeader>
					<CardTitle>Backup History</CardTitle>
					<CardDescription>Recent backup operations and their status</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingBackups ? (
						<div className="flex items-center justify-center py-8">
							<RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
							<span className="text-muted-foreground ml-2">Loading backup history...</span>
						</div>
					) : backups.length === 0 ? (
						<div className="text-muted-foreground py-8 text-center">
							<Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
							<p>No backup history available</p>
							<p className="text-sm">Backup records will appear here once created</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Status</TableHead>
									<TableHead>File Name</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Completed</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{backups.map((backup) => (
									<TableRow key={backup.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{getStatusIcon(backup.status)}
												{getStatusBadge(backup.status)}
											</div>
										</TableCell>
										<TableCell className="font-mono text-sm">{backup.fileName}</TableCell>
										<TableCell>{backup.fileSize ? formatBytes(backup.fileSize) : "-"}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className="capitalize">
												{backup.backupType || "manual"}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">{formatDate(backup.createdAt)}</TableCell>
										<TableCell className="text-muted-foreground text-sm">{formatDate(backup.completedAt)}</TableCell>
										<TableCell>
											{backup.r2Url && (
												<Button
													variant="ghost"
													size="sm"
													asChild>
													<a
														href={backup.r2Url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-1">
														<ExternalLink className="h-3 w-3" />
														View
													</a>
												</Button>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
