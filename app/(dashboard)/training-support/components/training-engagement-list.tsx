"use client";

import { useCallback, useEffect, useState } from "react";

import { BookOpen, Calendar, Eye, GraduationCap, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { deleteTrainingEngagement, getTrainingEngagementsList } from "@/lib/features/training/actions";
import { TrainingEngagementWithRelations, TrainingPhase, TrainingStatus } from "@/lib/features/training/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface TrainingEngagementListProps {
	search: string;
	statusFilter: string;
	typeFilter: string;
	page: number;
	pageSize: number;
}

export function TrainingEngagementList({ search = "", statusFilter = "ALL", typeFilter = "ALL", page = 1, pageSize = 20 }: TrainingEngagementListProps) {
	const [engagements, setEngagements] = useState<TrainingEngagementWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [engagementToDelete, setEngagementToDelete] = useState<TrainingEngagementWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedEngagementIds, setSelectedEngagementIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load engagements function
	const loadEngagements = useCallback(async () => {
		setLoading(true);
		try {
			const filters: any = {};
			if (statusFilter !== "ALL") filters.status = statusFilter;
			if (typeFilter !== "ALL") filters.phase = typeFilter;

			const result = await getTrainingEngagementsList(filters, {
				skip: (page - 1) * pageSize,
				take: pageSize,
			});

			if (result.success && result.data) {
				let filteredEngagements = result.data;

				// Client-side search filtering
				if (search) {
					filteredEngagements = filteredEngagements.filter((engagement) => engagement.title.toLowerCase().includes(search.toLowerCase()) || engagement.description?.toLowerCase().includes(search.toLowerCase()));
				}

				// Set total for pagination
				setTotal(filteredEngagements.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedEngagements = filteredEngagements.slice(startIndex, endIndex);

				setEngagements(paginatedEngagements);
			} else {
				console.error("Failed to load training engagements:", result.message);
				setEngagements([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Failed to load training engagements:", error);
			setEngagements([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, typeFilter, page, pageSize]);

	useEffect(() => {
		loadEngagements();
	}, [loadEngagements]);

	// Reset selected engagements when page changes
	useEffect(() => {
		setSelectedEngagementIds([]);
	}, [page]);

	// Real-time updates
	usePusher();
	useChannelEvent("private-global", "training-created", () => {
		loadEngagements();
	});
	useChannelEvent("private-global", "training-updated", () => {
		loadEngagements();
	});
	useChannelEvent("private-global", "training-deleted", () => {
		loadEngagements();
	});

	const handleDelete = async (engagement: TrainingEngagementWithRelations) => {
		setEngagementToDelete(engagement);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = async () => {
		if (!engagementToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteTrainingEngagement(engagementToDelete.id);
			if (result.success) {
				toast.success("Training engagement deleted successfully");
				loadEngagements();
				setSelectedEngagementIds((prev) => prev.filter((id) => id !== engagementToDelete.id));
			} else {
				toast.error(result.message || "Failed to delete training engagement");
			}
		} catch (error) {
			toast.error("Failed to delete training engagement");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setEngagementToDelete(null);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedEngagementIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			// For now, delete one by one - could be optimized with bulk delete action
			for (const id of selectedEngagementIds) {
				await deleteTrainingEngagement(id);
			}
			toast.success(`${selectedEngagementIds.length} training engagements deleted successfully`);
			loadEngagements();
			setSelectedEngagementIds([]);
		} catch (error) {
			toast.error("Failed to delete training engagements");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleSelectEngagement = (engagementId: string, checked: boolean) => {
		if (checked) {
			setSelectedEngagementIds((prev) => [...prev, engagementId]);
		} else {
			setSelectedEngagementIds((prev) => prev.filter((id) => id !== engagementId));
		}
	};

	const getStatusBadge = (status: TrainingStatus) => {
		const statusLabels: Record<TrainingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			DRAFT: { label: "Draft", variant: "secondary" },
			INTAKE: { label: "Intake", variant: "default" },
			PLANNING: { label: "Planning", variant: "secondary" },
			DISCOVERY: { label: "Discovery", variant: "default" },
			DESIGN: { label: "Design", variant: "default" },
			SCHEDULED: { label: "Scheduled", variant: "default" },
			IN_PROGRESS: { label: "In Progress", variant: "default" },
			ACTIVE: { label: "Active", variant: "default" },
			COMPLETED: { label: "Completed", variant: "outline" },
			ON_HOLD: { label: "On Hold", variant: "secondary" },
			CANCELLED: { label: "Cancelled", variant: "destructive" },
		};
		const config = statusLabels[status] || { label: status, variant: "outline" as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const getPhaseBadge = (phase: TrainingPhase) => {
		const phaseLabels: Record<TrainingPhase, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
			DISCOVERY: { label: "Discovery", variant: "secondary" },
			DESIGN: { label: "Design", variant: "default" },
			DEVELOPMENT: { label: "Development", variant: "default" },
			DELIVERY: { label: "Delivery", variant: "default" },
			ASSESSMENT: { label: "Assessment", variant: "outline" },
			SUPPORT: { label: "Support", variant: "outline" },
		};
		const config = phaseLabels[phase] || { label: phase, variant: "outline" as const };
		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions */}
			{selectedEngagementIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedEngagementIds.length}
					itemName="training engagement"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedEngagementIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Engagements Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{engagements.map((engagement) => (
					<Card
						key={engagement.id}
						className="relative gap-0 transition-shadow hover:shadow-lg">
						{/* Bulk Selection Checkbox */}
						<div className="absolute top-3 left-3 z-10">
							<Checkbox
								checked={selectedEngagementIds.includes(engagement.id)}
								onCheckedChange={(checked) => handleSelectEngagement(engagement.id, checked as boolean)}
								className="border-2 bg-white"
							/>
						</div>

						{/* Actions Menu */}
						<div className="absolute top-3 right-3 z-10">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 bg-white p-0 hover:bg-gray-50">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link href={`/training-support/${engagement.id}`}>
											<Eye className="mr-2 h-4 w-4" />
											View
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={`/training-support/${engagement.id}/edit`}>
											<Pencil className="mr-2 h-4 w-4" />
											Edit
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => handleDelete(engagement)}
										className="text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<CardHeader className="pb-4">
							<div className="flex items-start justify-between pt-8">
								<CardTitle className="line-clamp-2 pr-8 text-lg">{engagement.title}</CardTitle>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								{getStatusBadge(engagement.status)}
								{getPhaseBadge(engagement.phase)}
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{engagement.description}</p>

							<div className="space-y-2 text-sm">
								{engagement.customer && (
									<div className="flex items-center gap-2">
										<Users className="text-muted-foreground h-4 w-4" />
										<span>{engagement.customer.companyName}</span>
									</div>
								)}

								<div className="flex items-center gap-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<span>{engagement.startDate && engagement.endDate ? `${formatDate(engagement.startDate)} - ${formatDate(engagement.endDate)}` : "Date TBD"}</span>
								</div>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-1">
										<BookOpen className="text-muted-foreground h-4 w-4" />
										<span>{engagement.sessions?.length || 0} sessions</span>
									</div>
									<div className="flex items-center gap-1">
										<GraduationCap className="text-muted-foreground h-4 w-4" />
										<span>{engagement.registrations?.length || 0} participants</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* No items found */}
			{engagements.length === 0 && !loading && (
				<NoItemFound
					icon={<GraduationCap className="h-12 w-12" />}
					title="No training engagements found"
					description={search || statusFilter !== "ALL" || typeFilter !== "ALL" ? "Try adjusting your filters" : "Create your first training engagement to get started"}
					action={
						<Button asChild>
							<Link href="/training-support/new">
								<Plus className="h-4 w-4" />
								Create Training Engagement
							</Link>
						</Button>
					}
				/>
			)}

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="training engagements"
					baseUrl="/training-support"
					type={typeFilter !== "ALL" ? typeFilter : undefined}
					status={statusFilter !== "ALL" ? statusFilter : undefined}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Training Engagement"
				description={`Are you sure you want to delete "${engagementToDelete?.title}"? This action cannot be undone. All related sessions, assessments, and attendee data will be permanently removed.`}
				isDeleting={deleting}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
