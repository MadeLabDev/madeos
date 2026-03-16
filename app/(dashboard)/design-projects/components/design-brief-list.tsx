"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { DesignBriefStatus } from "@/generated/prisma/enums";
import { bulkDeleteDesignBriefs, deleteDesignBrief, getDesignBriefs } from "@/lib/features/design/actions";
import { DesignBriefWithRelations } from "@/lib/features/design/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface DesignBriefListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function DesignBriefList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: DesignBriefListProps) {
	const [briefs, setBriefs] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedBrief, setSelectedBrief] = useState<DesignBriefWithRelations | null>(null);

	// Checkbox selection state
	const [selectedBriefIds, setSelectedBriefIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Initialize Pusher
	usePusher();

	// Subscribe to design brief updates
	useChannelEvent("private-global", "design_brief_update", (data: any) => {
		const { action } = data;
		if (action === "design_brief_created" || action === "design_brief_updated" || action === "design_brief_deleted") {
			loadBriefs();
		}
	});

	// Load briefs function
	const loadBriefs = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as DesignBriefStatus }),
			};
			const result = await getDesignBriefs(filters, { take: 1000 }); // Get all for client-side filtering
			if (result.success && result.data) {
				let filteredBriefs = result.data as any[];

				// Client-side search filtering
				if (search) {
					filteredBriefs = filteredBriefs.filter((brief: any) => brief.designProject?.title?.toLowerCase().includes(search.toLowerCase()) || brief.targetAudience?.toLowerCase().includes(search.toLowerCase()) || brief.inspirations?.toLowerCase().includes(search.toLowerCase()));
				}

				// Set total for pagination
				setTotal(filteredBriefs.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedBriefs = filteredBriefs.slice(startIndex, endIndex);

				setBriefs(paginatedBriefs);
			} else {
				toast.error("Failed to load design briefs");
				setBriefs([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load design briefs");
			setBriefs([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	const handleDelete = async () => {
		if (!selectedBrief) return;

		setDeleting(true);
		try {
			const result = await deleteDesignBrief((selectedBrief as any).id);
			if (result.success) {
				toast.success("Design brief deleted successfully");
				loadBriefs();
			} else {
				toast.error(result.message || "Failed to delete design brief");
			}
		} catch (error) {
			toast.error("Failed to delete design brief");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedBrief(null);
		}
	};

	// Bulk actions
	const toggleSelectBrief = (briefId: string) => {
		setSelectedBriefIds((prev) => (prev.includes(briefId) ? prev.filter((id) => id !== briefId) : [...prev, briefId]));
	};

	const toggleSelectAll = () => {
		if (selectedBriefIds.length === briefs.length) {
			setSelectedBriefIds([]);
		} else {
			setSelectedBriefIds((briefs as any[]).map((brief: any) => brief.id));
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedBriefIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteDesignBriefs(selectedBriefIds);
			if (result.success) {
				toast.success(`Successfully deleted ${result.data?.deletedCount || selectedBriefIds.length} design briefs`);
				setSelectedBriefIds([]);
				loadBriefs();
			} else {
				toast.error(result.message || "Failed to delete design briefs");
			}
		} catch (error) {
			toast.error("Failed to delete design briefs");
		} finally {
			setBulkActionLoading(false);
		}
	};

	// Load data on mount and when filters change
	useEffect(() => {
		loadBriefs();
	}, [loadBriefs]);

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedBriefIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedBriefIds.length}
					itemName="design brief"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedBriefIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Design Briefs Grid */}
			{briefs.length === 0 ? (
				<NoItemFound
					title="No design briefs found"
					description="Get started by creating your first design brief."
					action={
						<Button asChild>
							<Link href="/design-projects/briefs/new">
								<Save className="mr-2 h-4 w-4" />
								Create Design Brief
							</Link>
						</Button>
					}
				/>
			) : (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={selectedBriefIds.length === briefs.length && briefs.length > 0}
							onCheckedChange={toggleSelectAll}
						/>
						<span className="text-muted-foreground text-sm">Select all</span>
					</div>

					{briefs.map((brief) => (
						<Card
							key={brief.id}
							className="m-0 gap-0 rounded-none border-0 border-b py-0 shadow-none">
							<CardContent className="p-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<Checkbox
											checked={selectedBriefIds.includes(brief.id)}
											onCheckedChange={() => toggleSelectBrief(brief.id)}
											aria-label={`Select ${brief.designProject?.title || "Unknown Project"}`}
											className="mt-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">
													<Link
														href={`/design-projects/projects/${brief.designProjectId}`}
														className="hover:underline">
														{brief.designProject?.title || "Unknown Project"}
													</Link>
												</h3>
												<Badge
													variant={brief.status === "APPROVED" ? "default" : brief.status === "REJECTED" ? "destructive" : "outline"}
													className="px-1.5 py-0 text-xs">
													{brief.status}
												</Badge>
											</div>
										</div>
									</div>{" "}
									{/* Status Badge and Actions */}
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
												<Link href={`/design-projects/projects/${brief.designProjectId}`}>
													<Eye className="mr-2 h-4 w-4" />
													View Project
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/design-projects/briefs/${brief.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit Brief
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => {
													setSelectedBrief(brief);
													setDeleteDialogOpen(true);
												}}>
												<Trash2 className="mr-2 h-4 w-4" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
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
					itemName="design briefs"
					baseUrl="/design-projects/briefs"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Design Brief"
				description={`Are you sure you want to delete this design brief? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
