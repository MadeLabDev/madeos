"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AssessmentWithRelations } from "@/lib/features/assessments";
import { deleteAssessmentAction, listAssessmentsAction } from "@/lib/features/assessments";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface AssessmentListProps {
	search?: string;
	statusFilter?: string;
	typeFilter?: string;
	page?: number;
	pageSize?: number;
}

export function AssessmentList({ search = "", statusFilter = "ALL", typeFilter = "ALL", page = 1, pageSize = 20 }: AssessmentListProps) {
	const [assessments, setAssessments] = useState<AssessmentWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [assessmentToDelete, setAssessmentToDelete] = useState<AssessmentWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedAssessmentIds, setSelectedAssessmentIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);
	const [users, setUsers] = useState<any[]>([]);

	// Load assessments function
	const loadAssessments = useCallback(async () => {
		setLoading(true);
		try {
			const result = await listAssessmentsAction({
				search: search || undefined,
				status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
				assessmentType: typeFilter !== "ALL" ? (typeFilter as any) : undefined,
				page,
				limit: pageSize,
			});

			if (result.success && result.data) {
				const data = result.data as any;
				setAssessments(data.assessments || []);
				setTotal(data.total || 0);
			} else {
				setAssessments([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Failed to load assessments:", error);
			setAssessments([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, typeFilter, page, pageSize]);

	// Load users for display
	const loadUsers = useCallback(async () => {
		try {
			const result = await getUsersAction();
			if (result.success) {
				setUsers((result.data as any)?.users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	}, []);

	// Load data on mount and when filters change
	useEffect(() => {
		loadAssessments();
		loadUsers();
	}, [loadAssessments, loadUsers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleAssessmentUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "assessment_created") {
				setAssessments((prev) => {
					if (prev.find((a) => a.id === data.assessment.id)) return prev;
					return page === 1 ? [data.assessment, ...prev] : prev;
				});
			} else if (data.action === "assessment_updated") {
				setAssessments((prev) => prev.map((a) => (a.id === data.assessment.id ? { ...a, ...data.assessment } : a)));
			} else if (data.action === "assessment_deleted") {
				setAssessments((prev) => prev.filter((a) => a.id !== data.assessmentId));
			} else {
				loadAssessments();
			}
		},
		[loadAssessments, page],
	);

	// Listen for assessment update events
	useChannelEvent("private-global", "assessment_update", handleAssessmentUpdate);

	// Checkbox handlers
	const toggleSelectAll = () => {
		setSelectedAssessmentIds(selectedAssessmentIds.length === assessments.length ? [] : assessments.map((assessment) => assessment.id));
	};

	const toggleSelectAssessment = (assessmentId: string) => {
		setSelectedAssessmentIds((prev) => (prev.includes(assessmentId) ? prev.filter((id) => id !== assessmentId) : [...prev, assessmentId]));
	};

	// Bulk delete handler
	const handleBulkDelete = async () => {
		if (selectedAssessmentIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const deletePromises = selectedAssessmentIds.map((id) => deleteAssessmentAction(id));
			const results = await Promise.allSettled(deletePromises);

			const successCount = results.filter((result) => result.status === "fulfilled" && result.value.success).length;
			const failureCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`Successfully deleted ${successCount} assessment${successCount > 1 ? "s" : ""}`);
			}
			if (failureCount > 0) {
				toast.error(`Failed to delete ${failureCount} assessment${failureCount > 1 ? "s" : ""}`);
			}

			setSelectedAssessmentIds([]);
			loadAssessments();
		} catch (error) {
			toast.error("Failed to delete selected assessments");
		} finally {
			setBulkActionLoading(false);
		}
	};

	// Handle single delete
	const handleDelete = async () => {
		if (!assessmentToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteAssessmentAction(assessmentToDelete.id);
			if (result.success) {
				toast.success("Assessment deleted successfully");
				loadAssessments();
				setDeleteDialogOpen(false);
				setAssessmentToDelete(null);
			} else {
				toast.error(result.message || "Failed to delete assessment");
			}
		} catch (error) {
			toast.error("Failed to delete assessment");
		} finally {
			setDeleting(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "PUBLISHED":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "ARCHIVED":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "QUIZ":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "EXAM":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "SURVEY":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getUserName = (userId: string | null) => {
		if (!userId) return "Unknown";
		const user = users.find((u) => u.id === userId);
		return user ? user.name || user.email : "Unknown";
	};

	if (loading) {
		return <div className="py-8 text-center">Loading assessments...</div>;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedAssessmentIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedAssessmentIds.length}
					itemName="Assessment"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedAssessmentIds([])}
					actions={[
						{
							label: `Delete ${selectedAssessmentIds.length} assessment${selectedAssessmentIds.length > 1 ? "s" : ""}`,
							onClick: handleBulkDelete,
							variant: "destructive" as const,
							disabled: bulkActionLoading,
						},
					]}
				/>
			)}

			{/* Assessments Table */}
			{assessments.length === 0 ? (
				<NoItemFound
					title="No assessments found"
					description="Get started by creating your first assessment."
					action={
						<Button asChild>
							<Link href="/training-support/assessments/new">Create Assessment</Link>
						</Button>
					}
				/>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">
									<Checkbox
										checked={selectedAssessmentIds.length === assessments.length}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Questions</TableHead>
								<TableHead>Created By</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{assessments.map((assessment) => (
								<TableRow key={assessment.id}>
									<TableCell>
										<Checkbox
											checked={selectedAssessmentIds.includes(assessment.id)}
											onCheckedChange={() => toggleSelectAssessment(assessment.id)}
											aria-label={`Select ${assessment.title}`}
										/>
									</TableCell>
									<TableCell>
										<Link
											href={`/training-support/assessments/${assessment.id}`}
											className="font-medium hover:underline">
											{assessment.title}
										</Link>
									</TableCell>
									<TableCell>
										<Badge className={getTypeColor(assessment.assessmentType)}>{assessment.assessmentType}</Badge>
									</TableCell>
									<TableCell>
										<Badge className={getStatusColor(assessment.status)}>{assessment.status}</Badge>
									</TableCell>
									<TableCell>{assessment.questions?.length || 0}</TableCell>
									<TableCell>{getUserName(assessment.createdBy)}</TableCell>
									<TableCell>{formatDate(assessment.updatedAt)}</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem asChild>
													<Link href={`/training-support/assessments/${assessment.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/training-support/assessments/${assessment.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setAssessmentToDelete(assessment);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="Assessments"
					baseUrl="/training-support/assessments"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Assessment"
				description={`Are you sure you want to delete "${assessmentToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
