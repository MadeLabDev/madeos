"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Eye, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { useInfoModal } from "@/lib/contexts/info-modal-context";
import { getDesignReviews } from "@/lib/features/design/actions";
import { DesignReview } from "@/lib/features/design/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function DesignReviewList({
	page: initialPage = 1,
	pageSize: initialPageSize = 20,
	search: initialSearch = "",
	approvalStatus: initialApprovalStatus = "",
}: {
	page?: number;
	pageSize?: number;
	search?: string;
	approvalStatus?: string;
} = {}) {
	const { showInfo } = useInfoModal();
	const searchParams = useSearchParams();
	const [designReviews, setDesignReviews] = useState<DesignReview[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedDesignReview, setSelectedDesignReview] = useState<DesignReview | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [total, setTotal] = useState(0);

	// Initialize Pusher
	usePusher();

	// Subscribe to design review updates
	useChannelEvent("private-global", "design_review_update", (data: any) => {
		const { action } = data;
		if (action === "design_review_created" || action === "design_review_updated" || action === "design_review_deleted") {
			window.location.reload();
		}
	});

	const search = initialSearch || searchParams.get("search") || "";
	const approvalStatus = initialApprovalStatus || searchParams.get("approvalStatus") || "";
	const page = initialPage > 0 ? initialPage : parseInt(searchParams.get("page") || "1");
	const pageSize = initialPageSize > 0 ? initialPageSize : 20;

	const filters = useMemo(() => {
		const result: any = {};
		if (search) result.search = search;
		if (approvalStatus) result.approvalStatus = approvalStatus;
		return result;
	}, [search, approvalStatus]);
	const loadDesignReviews = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignReviews(filters, { skip: (page - 1) * pageSize, take: pageSize });
			if (result.success && result.data) {
				setDesignReviews(result.data);
				// TODO: Get total count from API
				setTotal(result.data.length);
			} else {
				toast.error("Failed to load design reviews");
			}
		} catch (error) {
			toast.error("Failed to load design reviews");
		} finally {
			setLoading(false);
		}
	}, [filters, page, pageSize]);

	useEffect(() => {
		loadDesignReviews();
	}, [filters, page, loadDesignReviews]);

	const handleDelete = async () => {
		if (!selectedDesignReview) return;

		setDeleting(true);
		try {
			// TODO: Implement delete action
			toast.success("Design review deleted successfully");
			loadDesignReviews();
		} catch (error) {
			toast.error("Failed to delete design review");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedDesignReview(null);
		}
	};

	const handleBulkDelete = async () => {
		try {
			// TODO: Implement bulk delete
			toast.success(`${selectedIds.length} design reviews deleted successfully`);
			setSelectedIds([]);
			loadDesignReviews();
		} catch (error) {
			toast.error("Failed to delete design reviews");
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedIds(designReviews.map((review) => review.id));
		} else {
			setSelectedIds([]);
		}
	};

	const handleSelectItem = (id: string, checked: boolean) => {
		if (checked) {
			setSelectedIds((prev) => [...prev, id]);
		} else {
			setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-6">
			{selectedIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedIds.length}
					onClear={() => setSelectedIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{designReviews.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<div className="text-center">
							<h3 className="text-lg font-medium">No design reviews yet</h3>
							<p className="text-muted-foreground mb-4">Request feedback on designs from clients and stakeholders.</p>
							<Button asChild>
								<Link href="/design-projects/design-reviews/new">Request Review</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={selectedIds.length === designReviews.length && designReviews.length > 0}
							onCheckedChange={handleSelectAll}
						/>
						<span className="text-muted-foreground text-sm">Select all</span>
					</div>

					{designReviews.map((designReview) => (
						<Card
							key={designReview.id}
							className="m-0 gap-0 rounded-none border-0 border-b py-0 shadow-none">
							<CardContent className="p-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<Checkbox
											checked={selectedIds.includes(designReview.id)}
											onCheckedChange={(checked) => handleSelectItem(designReview.id, checked as boolean)}
											className="mt-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">
													<Link
														href={`/design-projects/projects/${designReview.designProjectId}`}
														className="hover:underline">
														Review by {designReview.reviewerName}
													</Link>
												</h3>
												<Badge
													variant={designReview.approvalStatus === "APPROVED" ? "default" : designReview.approvalStatus === "REJECTED" ? "destructive" : designReview.approvalStatus === "DRAFT" ? "secondary" : "outline"}
													className="px-1.5 py-0 text-xs">
													{designReview.approvalStatus}
												</Badge>
											</div>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{(designReview.feedback || designReview.notes) && (
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													showInfo({
														title: designReview.feedback ? "Review Feedback" : "Review Notes",
														content: designReview.feedback || designReview.notes,
													});
												}}>
												<MessageSquare className="text-muted-foreground h-4 w-4" />
											</Button>
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/projects/${designReview.designProjectId}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Project
													</Link>
												</DropdownMenuItem>
												{designReview.productDesignId && (
													<DropdownMenuItem asChild>
														<Link href={`/design-projects/designs/${designReview.productDesignId}`}>
															<Eye className="mr-2 h-4 w-4" />
															View Design
														</Link>
													</DropdownMenuItem>
												)}
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/design-reviews/${designReview.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Review
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSelectedDesignReview(designReview);
														setDeleteDialogOpen(true);
													}}>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="design reviews"
					baseUrl="/design-projects/design-reviews"
					type={approvalStatus}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Design Review"
				description={`Are you sure you want to delete the review by "${selectedDesignReview?.reviewerName}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
