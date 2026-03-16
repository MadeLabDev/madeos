"use client";

import { useCallback, useEffect, useState } from "react";

import { Copy, Eye, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { ProductDesignStatus } from "@/generated/prisma/enums";
import { useInfoModal } from "@/lib/contexts/info-modal-context";
import { bulkDeleteProductDesigns, deleteProductDesign, getProductDesigns } from "@/lib/features/design/actions";
import { ProductDesignWithRelations } from "@/lib/features/design/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

interface ProductDesignListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function ProductDesignList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: ProductDesignListProps) {
	const { showInfo } = useInfoModal();
	const [designs, setDesigns] = useState<ProductDesignWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [selectedDesign, setSelectedDesign] = useState<ProductDesignWithRelations | null>(null);

	// Checkbox selection state
	const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Initialize Pusher
	usePusher();

	// Subscribe to product design updates
	useChannelEvent("private-global", "product_design_update", (data: any) => {
		const { action } = data;
		if (action === "product_design_created" || action === "product_design_updated" || action === "product_design_deleted") {
			loadDesigns();
		}
	});

	// Load designs function
	const loadDesigns = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as ProductDesignStatus }),
			};
			const result = await getProductDesigns(filters, { take: 1000 }); // Get all for client-side filtering
			if (result.success && result.data) {
				let filteredDesigns = result.data;

				// Client-side search filtering
				if (search) {
					filteredDesigns = filteredDesigns.filter((design) => design.name.toLowerCase().includes(search.toLowerCase()) || design.description?.toLowerCase().includes(search.toLowerCase()) || design.designType.toLowerCase().includes(search.toLowerCase()) || design.productType?.toLowerCase().includes(search.toLowerCase()));
				}

				// Set total for pagination
				setTotal(filteredDesigns.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedDesigns = filteredDesigns.slice(startIndex, endIndex);

				setDesigns(paginatedDesigns);
			} else {
				toast.error("Failed to load product designs");
				setDesigns([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load product designs");
			setDesigns([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load data on mount and when filters change
	useEffect(() => {
		loadDesigns();
	}, [loadDesigns]);

	const handleDelete = async () => {
		if (!selectedDesign) return;

		setDeleting(true);
		try {
			const result = await deleteProductDesign(selectedDesign.id);
			if (result.success) {
				toast.success("Product design deleted successfully");
				loadDesigns();
			} else {
				toast.error(result.message || "Failed to delete product design");
			}
		} catch (error) {
			toast.error("Failed to delete product design");
		} finally {
			setDeleting(false);
			setDeleteDialogOpen(false);
			setSelectedDesign(null);
		}
	};

	// Bulk actions
	const toggleSelectDesign = (designId: string) => {
		setSelectedDesignIds((prev) => (prev.includes(designId) ? prev.filter((id) => id !== designId) : [...prev, designId]));
	};

	const toggleSelectAll = () => {
		if (selectedDesignIds.length === designs.length) {
			setSelectedDesignIds([]);
		} else {
			setSelectedDesignIds(designs.map((design) => design.id));
		}
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedDesignIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteProductDesigns(selectedDesignIds);
			if (result.success) {
				toast.success(`Successfully deleted ${result.data?.deletedCount || selectedDesignIds.length} product designs`);
				setSelectedDesignIds([]);
				loadDesigns();
			} else {
				toast.error(result.message || "Failed to delete product designs");
			}
		} catch (error) {
			toast.error("Failed to delete product designs");
		} finally {
			setBulkActionLoading(false);
		}
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedDesignIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedDesignIds.length}
					itemName="product design"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedDesignIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Product Designs Grid */}
			{designs.length === 0 ? (
				<NoItemFound
					title="No product designs found"
					description="Get started by creating your first product design."
					action={
						<Button asChild>
							<Link href="/design-projects/designs/new">Create Product Design</Link>
						</Button>
					}
				/>
			) : (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={selectedDesignIds.length === designs.length && designs.length > 0}
							onCheckedChange={toggleSelectAll}
						/>
						<span className="text-muted-foreground text-sm">Select all</span>
					</div>

					{designs.map((design) => (
						<Card
							key={design.id}
							className="m-0 gap-0 rounded-none border-0 border-b py-0 shadow-none">
							<CardContent className="p-0">
								<div className="flex min-h-14 items-center justify-between gap-3">
									<div className="flex min-w-0 flex-1 items-center gap-2">
										<Checkbox
											checked={selectedDesignIds.includes(design.id)}
											onCheckedChange={() => toggleSelectDesign(design.id)}
											aria-label={`Select ${design.name}`}
											className="mt-0"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-1">
												<h3 className="truncate text-sm font-semibold">
													<Link
														href={`/design-projects/projects/${design.designProjectId}`}
														className="hover:underline">
														{design.name}
													</Link>
												</h3>
												<Badge
													variant="outline"
													className="px-1.5 py-0 text-xs">
													{design.designType}
												</Badge>
												<Badge
													variant={design.status === "APPROVED" ? "default" : design.status === "DRAFT" ? "secondary" : design.status === "REJECTED" ? "destructive" : "outline"}
													className="px-1.5 py-0 text-xs">
													{design.status}
												</Badge>
												{design.version > 1 && (
													<Badge
														variant="outline"
														className="px-1.5 py-0 text-xs">
														v{design.version}
													</Badge>
												)}
											</div>
										</div>
									</div>

									{/* Status Badge and Actions */}
									<div className="flex shrink-0 items-center gap-1">
										{design.feasibilityNotes && (
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0"
												onClick={() => {
													showInfo({
														title: "Feasibility Notes",
														content: design.feasibilityNotes,
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
													<Link href={`/design-projects/projects/${design.designProjectId}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Project
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/designs/${design.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit Design
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Copy className="mr-2 h-4 w-4" />
													Create Version
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSelectedDesign(design);
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
					itemName="product designs"
					baseUrl="/design-projects/designs"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Product Design"
				description={`Are you sure you want to delete "${selectedDesign?.name}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
