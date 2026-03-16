"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, Globe, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteEventMicrositeAction, getEventMicrositesAction, updateEventMicrositePublishStatusAction } from "@/lib/features/marketing/actions";
import { EventMicrosite } from "@/lib/features/marketing/types";
import { formatDate } from "@/lib/utils";

interface EventMicrositeListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function EventMicrositeList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: EventMicrositeListProps) {
	const [microsites, setMicrosites] = useState<EventMicrosite[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [micrositeToDelete, setMicrositeToDelete] = useState<EventMicrosite | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Load microsites function
	const loadMicrosites = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getEventMicrositesAction(page, pageSize);

			if (result.data?.microsites) {
				let filteredMicrosites = result.data.microsites;

				// Client-side search filtering
				if (search) {
					filteredMicrosites = filteredMicrosites.filter((microsite) => microsite.heroTitle.toLowerCase().includes(search.toLowerCase()) || (microsite.heroSubtitle && microsite.heroSubtitle.toLowerCase().includes(search.toLowerCase())) || (microsite.description && microsite.description.toLowerCase().includes(search.toLowerCase())));
				}

				// Client-side status filtering
				if (statusFilter !== "ALL") {
					if (statusFilter === "PUBLISHED") {
						filteredMicrosites = filteredMicrosites.filter((microsite) => microsite.isPublished);
					} else if (statusFilter === "DRAFT") {
						filteredMicrosites = filteredMicrosites.filter((microsite) => !microsite.isPublished);
					}
				}

				setMicrosites(filteredMicrosites);
				setTotal(result.data?.total || 0);
			} else {
				setMicrosites([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Error loading microsites:", error);
			toast.error("Failed to load microsites");
			setMicrosites([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load microsites on mount and when dependencies change
	useEffect(() => {
		loadMicrosites();
	}, [loadMicrosites]);

	// Real-time updates
	// const { channel } = usePusher();
	// useChannelEvent(channel, "microsite_update", (data: any) => {
	// 	console.log("Microsite update received:", data);
	// 	loadMicrosites();
	// });

	// Handle delete
	const handleDelete = async () => {
		if (!micrositeToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteEventMicrositeAction(micrositeToDelete.id);
			if (result.success) {
				toast.success("Microsite deleted successfully");
				setDeleteDialogOpen(false);
				setMicrositeToDelete(null);
				loadMicrosites();
			} else {
				toast.error(result.message || "Failed to delete microsite");
			}
		} catch (error) {
			console.error("Error deleting microsite:", error);
			toast.error("Failed to delete microsite");
		} finally {
			setDeleting(false);
		}
	};

	// Handle publish/unpublish
	const handleTogglePublish = async (microsite: EventMicrosite) => {
		try {
			const result = await updateEventMicrositePublishStatusAction(microsite.id, !microsite.isPublished);
			if (result.success) {
				toast.success(`Microsite ${!microsite.isPublished ? "published" : "unpublished"} successfully`);
				loadMicrosites();
			} else {
				toast.error(result.message || "Failed to update publish status");
			}
		} catch (error) {
			console.error("Error updating publish status:", error);
			toast.error("Failed to update publish status");
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (microsites.length === 0) {
		return <NoItemFound text="No microsites found" />;
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
							<TableHead>Status</TableHead>
							<TableHead>Published At</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-[70px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{microsites.map((microsite) => (
							<TableRow key={microsite.id}>
								<TableCell className="font-medium">
									<div>
										<div className="font-semibold">{microsite.heroTitle}</div>
										{microsite.heroSubtitle && <div className="text-muted-foreground text-sm">{microsite.heroSubtitle}</div>}
									</div>
								</TableCell>
								<TableCell>
									{microsite.event ? (
										<Link
											href={`/events/${microsite.eventId}`}
											className="text-blue-600 hover:underline">
											{microsite.event.title}
										</Link>
									) : (
										<span className="text-muted-foreground">Event not found</span>
									)}
								</TableCell>
								<TableCell>
									<Badge variant={microsite.isPublished ? "default" : "secondary"}>{microsite.isPublished ? "Published" : "Draft"}</Badge>
								</TableCell>
								<TableCell>{microsite.publishedAt ? formatDate(microsite.publishedAt) : "-"}</TableCell>
								<TableCell>{formatDate(microsite.createdAt)}</TableCell>
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
												<Link href={`/marketing/microsites/${microsite.eventId}`}>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</Link>
											</DropdownMenuItem>
											{microsite.isPublished && (
												<DropdownMenuItem asChild>
													<Link
														href={`/public/events/${microsite.eventId}`}
														target="_blank">
														<Globe className="mr-2 h-4 w-4" />
														View Public Page
													</Link>
												</DropdownMenuItem>
											)}
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => handleTogglePublish(microsite)}>{microsite.isPublished ? "Unpublish" : "Publish"}</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/marketing/microsites/${microsite.eventId}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => {
													setMicrositeToDelete(microsite);
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
					baseUrl="/marketing/microsites"
					search={search}
					status={statusFilter}
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Microsite"
				description={`Are you sure you want to delete "${micrositeToDelete?.heroTitle}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
