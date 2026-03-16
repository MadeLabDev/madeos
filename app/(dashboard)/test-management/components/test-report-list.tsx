"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { Calendar, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteTestReport, getTestReports } from "@/lib/features/testing/actions";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

// Define ReportStatus enum locally to avoid importing from Prisma
enum ReportStatus {
	DRAFT = "DRAFT",
	REVIEW = "REVIEW",
	APPROVED = "APPROVED",
	PUBLISHED = "PUBLISHED",
}

interface TestReportListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function TestReportList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: TestReportListProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [reports, setReports] = useState<any[]>([]);
	const [searchTerm, setSearchTerm] = useState(search);
	const [statusFilterState, setStatusFilterState] = useState(statusFilter);
	const [users, setUsers] = useState<any[]>([]);

	useEffect(() => {
		loadReports();
		loadUsers();
	}, [page, pageSize]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleTestReportUpdate = useCallback((eventData: any) => {
		const data = eventData.data || eventData;

		if (data.action === "test_report_created" || data.action === "test_report_updated" || data.action === "test_report_deleted") {
			loadReports();
		}
	}, []);

	// Listen for test report update events
	useChannelEvent("private-global", "test_report_update", handleTestReportUpdate);

	useEffect(() => {
		setSearchTerm(search);
	}, [search]);

	useEffect(() => {
		setStatusFilterState(statusFilter);
	}, [statusFilter]);

	const loadReports = async () => {
		try {
			setLoading(true);
			const result = await getTestReports();
			if (result.success) {
				setReports(result.data || []);
			} else {
				toast.error("Failed to load reports");
			}
		} catch (error) {
			toast.error("Failed to load reports");
		} finally {
			setLoading(false);
		}
	};

	const loadUsers = async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	};

	const handleDelete = async (reportId: string) => {
		try {
			const result = await deleteTestReport(reportId);
			if (result.success) {
				toast.success("Report deleted successfully");
				loadReports();
			} else {
				toast.error(result.message || "Failed to delete report");
			}
		} catch (error) {
			toast.error("Failed to delete report");
		}
	};

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	const getStatusBadge = (status: ReportStatus) => {
		switch (status) {
			case ReportStatus.DRAFT:
				return <Badge variant="secondary">Draft</Badge>;
			case ReportStatus.REVIEW:
				return <Badge variant="outline">Under Review</Badge>;
			case ReportStatus.APPROVED:
				return <Badge variant="default">Approved</Badge>;
			case ReportStatus.PUBLISHED:
				return (
					<Badge
						variant="default"
						className="bg-green-500">
						Published
					</Badge>
				);
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	const filteredReports = reports.filter((report) => {
		const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || report.testOrder?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilterState === "all" || report.status === statusFilterState;
		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader size="lg" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Reports Table */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						Reports ({filteredReports.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{filteredReports.length === 0 ? (
						<div className="py-8 text-center">
							<FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
							<h3 className="text-lg font-medium">No reports found</h3>
							<p className="text-muted-foreground">{searchTerm || statusFilterState !== "all" ? "Try adjusting your search or filters." : "Get started by creating your first test report."}</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Title</TableHead>
										<TableHead>Test Order</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Report Date</TableHead>
										<TableHead>Tested By</TableHead>
										<TableHead className="w-24">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredReports.map((report) => (
										<TableRow key={report.id}>
											<TableCell className="font-medium">
												<div>
													<p className="font-medium">{report.title}</p>
													{report.summary && <p className="text-muted-foreground line-clamp-1 text-sm">{report.summary}</p>}
												</div>
											</TableCell>
											<TableCell>
												{report.testOrder ? (
													<Button
														variant="link"
														className="h-auto p-0 font-medium"
														onClick={() => router.push(`/test-management/orders/${report.testOrder.id}`)}>
														{report.testOrder.orderNumber}
													</Button>
												) : (
													<span className="text-muted-foreground">N/A</span>
												)}
											</TableCell>
											<TableCell>{getStatusBadge(report.status)}</TableCell>
											<TableCell>
												<div className="flex items-center text-sm">
													<Calendar className="text-muted-foreground mr-1 h-4 w-4" />
													{report.generatedAt ? format(new Date(report.generatedAt), "MMM dd, yyyy") : report.createdAt ? format(new Date(report.createdAt), "MMM dd, yyyy") : "N/A"}
												</div>
											</TableCell>
											<TableCell>{report.testedBy ? getUserName(report.testedBy) : "Not assigned"}</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/test-management/reports/${report.id}`)}>
														<Eye className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/test-management/reports/${report.id}/edit`)}>
														<Pencil className="h-4 w-4" />
													</Button>
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
																<AlertDialogTitle>Delete Test Report</AlertDialogTitle>
																<AlertDialogDescription>Are you sure you want to delete "{report.title}"? This action cannot be undone.</AlertDialogDescription>
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
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
