"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { Download, Edit, Eye, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTrainingReportAction, getTrainingReportsAction } from "@/lib/features/training/actions/training-report.actions";
import { TrainingReportWithRelations } from "@/lib/features/training/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface TrainingReportsListProps {
	engagementId: string;
}

export function TrainingReportsList({ engagementId }: TrainingReportsListProps) {
	const [reports, setReports] = useState<TrainingReportWithRelations[]>([]);
	const [loading, setLoading] = useState(true);

	usePusher();

	const loadReports = useCallback(async () => {
		try {
			const result = await getTrainingReportsAction({ trainingEngagementId: engagementId });
			if (result.success) {
				setReports(result.data || []);
			} else {
				toast.error("Failed to load training reports");
			}
		} catch (error) {
			toast.error("Failed to load training reports");
		} finally {
			setLoading(false);
		}
	}, [engagementId]);

	const handleTrainingReportUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;
			if (data.action === "training_report_created" || data.action === "training_report_updated" || data.action === "training_report_deleted") {
				loadReports();
			}
		},
		[loadReports],
	);

	useChannelEvent("private-global", "training_report_update", handleTrainingReportUpdate);

	useEffect(() => {
		loadReports();
	}, [engagementId, loadReports]);

	const handleDelete = async (reportId: string) => {
		try {
			const result = await deleteTrainingReportAction(reportId);
			if (result.success) {
				toast.success("Training report deleted successfully");
				loadReports();
			} else {
				toast.error(result.message || "Failed to delete training report");
			}
		} catch (error) {
			toast.error("Failed to delete training report");
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "DRAFT":
				return <Badge variant="secondary">Draft</Badge>;
			case "REVIEW":
				return <Badge variant="outline">Review</Badge>;
			case "APPROVED":
				return <Badge variant="default">Approved</Badge>;
			case "PUBLISHED":
				return <Badge className="bg-green-500">Published</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<Card
						key={i}
						className="animate-pulse">
						<CardHeader>
							<div className="bg-muted h-4 w-1/4 rounded"></div>
							<div className="bg-muted h-3 w-1/2 rounded"></div>
						</CardHeader>
						<CardContent>
							<div className="bg-muted mb-2 h-3 w-full rounded"></div>
							<div className="bg-muted h-3 w-3/4 rounded"></div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Reports ({reports.length})</h2>
				</div>
				<Button asChild>
					<Link href={`/training-support/${engagementId}/reports/new`}>
						<Plus className="mr-2 h-4 w-4" />
						Create Report
					</Link>
				</Button>
			</div>

			{reports.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="text-muted-foreground mb-4 h-12 w-12" />
						<h3 className="mb-2 text-lg font-medium">No training reports yet</h3>
						<p className="text-muted-foreground mb-4 text-center">Create your first training report to track completion metrics and outcomes.</p>
						<Button asChild>
							<Link href={`/training-support/${engagementId}/reports/new`}>
								<Plus className="mr-2 h-4 w-4" />
								Create First Report
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{reports.map((report) => (
						<Card key={report.id}>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<CardTitle className="text-lg">{report.title}</CardTitle>
										<div className="flex items-center gap-2">
											{getStatusBadge(report.status)}
											<span className="text-muted-foreground text-sm">{report.reportDate ? format(new Date(report.reportDate), "PPP") : "No date"}</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											asChild>
											<Link href={`/training-support/${engagementId}/reports/${report.id}`}>
												<Eye className="h-4 w-4" />
											</Link>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											asChild>
											<Link href={`/training-support/${engagementId}/reports/${report.id}/edit`}>
												<Edit className="h-4 w-4" />
											</Link>
										</Button>
										{report.reportFileId && (
											<Button
												variant="ghost"
												size="sm">
												<Download className="h-4 w-4" />
											</Button>
										)}
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm">
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Training Report</AlertDialogTitle>
													<AlertDialogDescription>Are you sure you want to delete this training report? This action cannot be undone.</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleDelete(report.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
									<div>
										<span className="font-medium">Participants:</span>
										<p className="text-muted-foreground">{report.totalParticipants || 0}</p>
									</div>
									<div>
										<span className="font-medium">Attended:</span>
										<p className="text-muted-foreground">{report.totalAttended || 0}</p>
									</div>
									<div>
										<span className="font-medium">Completion:</span>
										<p className="text-muted-foreground">{report.completionRate ? `${Math.round(report.completionRate * 100)}%` : "N/A"}</p>
									</div>
									<div>
										<span className="font-medium">Avg Score:</span>
										<p className="text-muted-foreground">{report.averageScore || "N/A"}</p>
									</div>
								</div>
								{report.description && (
									<div className="mt-3">
										<p className="text-muted-foreground line-clamp-2 text-sm">{report.description}</p>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
