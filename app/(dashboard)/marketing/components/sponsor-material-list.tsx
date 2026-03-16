"use client";

import { useCallback, useEffect, useState } from "react";

import { CheckCircle, Clock, Eye, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteSponsorMaterialAction, getSponsorMaterialsAction, updateSponsorMaterialStatusAction } from "@/lib/features/marketing/actions";
import { SponsorMaterial, SponsorMaterialFilters } from "@/lib/features/marketing/types";
import { formatDate } from "@/lib/utils";

interface SponsorMaterialListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function SponsorMaterialList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: SponsorMaterialListProps) {
	const [materials, setMaterials] = useState<SponsorMaterial[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [materialToDelete, setMaterialToDelete] = useState<SponsorMaterial | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Load materials function
	const loadMaterials = useCallback(async () => {
		setLoading(true);
		try {
			const filters: SponsorMaterialFilters = {};
			if (statusFilter !== "ALL") {
				filters.status = statusFilter as "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";
			}
			const result = await getSponsorMaterialsAction(filters, page, pageSize);

			if (result.success && result.data?.materials) {
				let filteredMaterials = result.data?.materials;

				// Client-side search filtering
				if (search) {
					filteredMaterials = filteredMaterials.filter((material) => material.title.toLowerCase().includes(search.toLowerCase()) || (material.description && material.description.toLowerCase().includes(search.toLowerCase())));
				}

				setMaterials(filteredMaterials);
				setTotal(result.data?.total || 0);
			} else {
				// Handle permission denied or other errors gracefully
				console.warn("Failed to load sponsor materials:", result.message);
				setMaterials([]);
				setTotal(0);
				if (result.message?.includes("permission")) {
					toast.error("You don't have permission to view sponsor materials");
				}
			}
		} catch (error) {
			console.error("Error loading materials:", error);
			toast.error("Failed to load sponsor materials");
			setMaterials([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load materials on mount and when dependencies change
	useEffect(() => {
		loadMaterials();
	}, [loadMaterials]);

	// Real-time updates
	// const { channel } = usePusher();
	// useChannelEvent(channel, "sponsor_material_update", (data: any) => {
	// 	console.log("Sponsor material update received:", data);
	// 	loadMaterials();
	// });

	// Handle delete
	const handleDelete = async () => {
		if (!materialToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteSponsorMaterialAction(materialToDelete.id);
			if (result.success) {
				toast.success("Sponsor material deleted successfully");
				setDeleteDialogOpen(false);
				setMaterialToDelete(null);
				loadMaterials();
			} else {
				toast.error(result.message || "Failed to delete sponsor material");
			}
		} catch (error) {
			console.error("Error deleting sponsor material:", error);
			toast.error("Failed to delete sponsor material");
		} finally {
			setDeleting(false);
		}
	};

	// Handle status update
	const handleStatusUpdate = async (material: SponsorMaterial, newStatus: string) => {
		try {
			const result = await updateSponsorMaterialStatusAction(material.id, newStatus);
			if (result.success) {
				toast.success(`Material status updated to ${newStatus}`);
				loadMaterials();
			} else {
				toast.error(result.message || "Failed to update material status");
			}
		} catch (error) {
			console.error("Error updating material status:", error);
			toast.error("Failed to update material status");
		}
	};

	// Get status badge variant
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "PENDING":
				return "secondary";
			case "SUBMITTED":
				return "default";
			case "APPROVED":
				return "default";
			case "REJECTED":
				return "destructive";
			case "REVISION_REQUESTED":
				return "outline";
			default:
				return "secondary";
		}
	};

	if (loading) {
		return <PageLoading />;
	}

	if (materials.length === 0) {
		return <NoItemFound text="No sponsor materials found" />;
	}

	return (
		<div className="space-y-4">
			{/* Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Event</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Due Date</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[70px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{materials.map((material) => (
							<TableRow key={material.id}>
								<TableCell className="font-medium">
									<div>
										<div className="font-semibold">{material.title}</div>
										{material.description && <div className="text-muted-foreground line-clamp-1 text-sm">{material.description}</div>}
									</div>
								</TableCell>
								<TableCell>
									{material.event ? (
										<Link
											href={`/events/${material.eventId}`}
											className="text-blue-600 hover:underline">
											{material.event.title}
										</Link>
									) : (
										<span className="text-muted-foreground">Event not found</span>
									)}
								</TableCell>
								<TableCell>
									<Badge variant="outline">{material.type}</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(material.status)}>{material.status.replace("_", " ")}</Badge>
								</TableCell>
								<TableCell>
									{material.dueDate ? (
										<div className="flex items-center gap-2">
											<span>{formatDate(material.dueDate)}</span>
											{material.dueDate < new Date() && material.status !== "APPROVED" && (
												<Badge
													variant="destructive"
													className="text-xs">
													Overdue
												</Badge>
											)}
										</div>
									) : (
										"-"
									)}
								</TableCell>
								<TableCell>{formatDate(material.createdAt)}</TableCell>
								<TableCell>
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
												<Link href={`/marketing/sponsors/event/${material.eventId}`}>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											{material.status === "PENDING" && (
												<DropdownMenuItem onClick={() => handleStatusUpdate(material, "SUBMITTED")}>
													<CheckCircle className="mr-2 h-4 w-4" />
													Mark as Submitted
												</DropdownMenuItem>
											)}
											{material.status === "SUBMITTED" && (
												<>
													<DropdownMenuItem onClick={() => handleStatusUpdate(material, "APPROVED")}>
														<CheckCircle className="mr-2 h-4 w-4" />
														Approve
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleStatusUpdate(material, "REVISION_REQUESTED")}>
														<Clock className="mr-2 h-4 w-4" />
														Request Revision
													</DropdownMenuItem>
													<DropdownMenuItem onClick={() => handleStatusUpdate(material, "REJECTED")}>
														<XCircle className="mr-2 h-4 w-4" />
														Reject
													</DropdownMenuItem>
												</>
											)}
											{material.status === "REVISION_REQUESTED" && (
												<DropdownMenuItem onClick={() => handleStatusUpdate(material, "SUBMITTED")}>
													<CheckCircle className="mr-2 h-4 w-4" />
													Mark as Resubmitted
												</DropdownMenuItem>
											)}
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link href={`/marketing/sponsors/${material.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => {
													setMaterialToDelete(material);
													setDeleteDialogOpen(true);
												}}
												className="text-red-600">
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

			{/* Pagination */}
			{total > pageSize && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					baseUrl="/marketing/sponsors"
					search={search}
					status={statusFilter}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Sponsor Material"
				description={`Are you sure you want to delete "${materialToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
