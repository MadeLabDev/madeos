"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle, FileText, Pencil, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { deleteTestReport, getTestReportById } from "@/lib/features/testing/actions";
import { getUsersAction } from "@/lib/features/users/actions";

// Define ReportStatus enum locally to avoid importing from Prisma types
enum ReportStatus {
	DRAFT = "DRAFT",
	REVIEW = "REVIEW",
	APPROVED = "APPROVED",
	PUBLISHED = "PUBLISHED",
	REJECTED = "REJECTED",
}
import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";

interface TestReportDetailProps {
	reportId: string;
}

export function TestReportDetail({ reportId }: TestReportDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [report, setReport] = useState<any>(null);
	const [users, setUsers] = useState<any[]>([]);
	const loadReport = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestReportById(reportId);
			if (result.success && result.data) {
				setReport(result.data);
			} else {
				toast.error("Failed to load report");
				router.back();
			}
		} catch (error) {
			toast.error("Failed to load report");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [reportId, router]);

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

	useEffect(() => {
		loadReport();
		loadUsers();
	}, [reportId, loadReport]);

	const handleDelete = async () => {
		try {
			const result = await deleteTestReport(reportId);
			if (result.success) {
				toast.success("Report deleted successfully");
				router.back();
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

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader size="lg" />
			</div>
		);
	}

	if (!report) {
		return (
			<div className="py-8 text-center">
				<FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
				<h3 className="text-lg font-medium">Report not found</h3>
				<p className="text-muted-foreground">The test report you're looking for doesn't exist.</p>
				<Button
					onClick={() => router.back()}
					className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<>
			<SetBreadcrumb
				segment={reportId}
				label={report.title}
			/>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<div>
							<h1 className="text-2xl font-bold">{report.title}</h1>
							<div className="mt-1 flex items-center space-x-2">
								{getStatusBadge(report.status)}
								<span className="text-muted-foreground text-sm">Report Date: {report.generatedAt ? format(new Date(report.generatedAt), "PPP") : report.createdAt ? format(new Date(report.createdAt), "PPP") : "N/A"}</span>
							</div>
						</div>
					</div>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							onClick={() => router.push(`/test-management/reports/${reportId}/edit`)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Test Report</AlertDialogTitle>
									<AlertDialogDescription>Are you sure you want to delete this test report? This action cannot be undone.</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				{/* Report Details */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 lg:col-span-2">
						{/* Executive Summary */}
						{report.summary && (
							<Card>
								<CardHeader>
									<CardTitle>Executive Summary</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed">{report.summary}</p>
								</CardContent>
							</Card>
						)}

						{/* Test Findings */}
						{report.findings && (
							<Card>
								<CardHeader>
									<CardTitle>Test Findings</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-sm max-w-none">
										<p className="whitespace-pre-wrap">{report.findings}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Recommendations */}
						{report.recommendations && (
							<Card>
								<CardHeader>
									<CardTitle>Recommendations</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="prose prose-sm max-w-none">
										<p className="whitespace-pre-wrap">{report.recommendations}</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Conclusion */}
						{report.conclusion && (
							<Card>
								<CardHeader>
									<CardTitle>Conclusion</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm leading-relaxed">{report.conclusion}</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Report Information */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Report Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<div>
										<p className="text-sm font-medium">Report Date</p>
										<p className="text-muted-foreground text-sm">{report.generatedAt ? format(new Date(report.generatedAt), "PPP") : report.createdAt ? format(new Date(report.createdAt), "PPP") : "N/A"}</p>
									</div>
								</div>

								{report.approvedAt && (
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<div>
											<p className="text-sm font-medium">Approved Date</p>
											<p className="text-muted-foreground text-sm">{format(new Date(report.approvedAt), "PPP")}</p>
										</div>
									</div>
								)}

								<Separator />

								{/* Personnel */}
								{report.testedBy && (
									<div className="flex items-center space-x-2">
										<User className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Tested By</p>
											<p className="text-muted-foreground text-sm">{getUserName(report.testedBy)}</p>
										</div>
									</div>
								)}

								{report.reviewedBy && (
									<div className="flex items-center space-x-2">
										<User className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Reviewed By</p>
											<p className="text-muted-foreground text-sm">{getUserName(report.reviewedBy)}</p>
										</div>
									</div>
								)}

								{report.approvedBy && (
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<div>
											<p className="text-sm font-medium">Approved By</p>
											<p className="text-muted-foreground text-sm">{getUserName(report.approvedBy)}</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Related Entities */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Related</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{report.testOrder && (
									<div>
										<p className="text-sm font-medium">Test Order</p>
										<Button
											variant="link"
											className="h-auto p-0 text-sm"
											onClick={() => router.push(`/test-management/orders/${report.testOrder.id}`)}>
											{report.testOrder.orderNumber}
										</Button>
									</div>
								)}

								{report.test && (
									<div>
										<p className="text-sm font-medium">Test</p>
										<Button
											variant="link"
											className="h-auto p-0 text-sm"
											onClick={() => router.push(`/test-management/tests/${report.test.id}`)}>
											{report.test.name}
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
