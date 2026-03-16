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
import { deleteSOPAction, listSOPsAction } from "@/lib/features/sop-library/actions/sop-library.actions";
import { SOPLibraryWithRelations } from "@/lib/features/sop-library/types/sop-library.types";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface SOPLibraryListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function SOPLibraryList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: SOPLibraryListProps) {
	const [sops, setSops] = useState<SOPLibraryWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sopToDelete, setSopToDelete] = useState<SOPLibraryWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedSopIds, setSelectedSopIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);
	const [users, setUsers] = useState<any[]>([]);

	// Load SOPs function
	const loadSops = useCallback(async () => {
		setLoading(true);
		try {
			const result = await listSOPsAction({
				search: search || undefined,
				status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
				page,
				limit: pageSize,
			});

			if (result.success && result.data) {
				const data = result.data as any;
				setSops(data.sops || []);
				setTotal(data.total || 0);
			} else {
				setSops([]);
				setTotal(0);
			}
		} catch (error) {
			console.error("Failed to load SOPs:", error);
			setSops([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

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
		loadSops();
		loadUsers();
	}, [loadSops, loadUsers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleSopUpdate = useCallback(
		(eventData: any) => {
			const data = eventData.data || eventData;

			if (data.action === "sop_created") {
				setSops((prev) => {
					if (prev.find((s) => s.id === data.sop.id)) return prev;
					return page === 1 ? [data.sop, ...prev] : prev;
				});
			} else if (data.action === "sop_updated") {
				setSops((prev) => prev.map((s) => (s.id === data.sop.id ? { ...s, ...data.sop } : s)));
			} else if (data.action === "sop_deleted") {
				setSops((prev) => prev.filter((s) => s.id !== data.sopId));
			} else {
				loadSops();
			}
		},
		[loadSops, page],
	);

	// Listen for SOP update events
	useChannelEvent("private-global", "sop_update", handleSopUpdate);

	// Checkbox handlers
	const toggleSelectAll = () => {
		setSelectedSopIds(selectedSopIds.length === sops.length ? [] : sops.map((sop) => sop.id));
	};

	const toggleSelectSop = (sopId: string) => {
		setSelectedSopIds((prev) => (prev.includes(sopId) ? prev.filter((id) => id !== sopId) : [...prev, sopId]));
	};

	// Bulk delete handler
	const handleBulkDelete = async () => {
		if (selectedSopIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const deletePromises = selectedSopIds.map((id) => deleteSOPAction(id));
			const results = await Promise.allSettled(deletePromises);

			const successCount = results.filter((result) => result.status === "fulfilled" && result.value.success).length;
			const failureCount = results.length - successCount;

			if (successCount > 0) {
				toast.success(`Successfully deleted ${successCount} SOP${successCount > 1 ? "s" : ""}`);
			}
			if (failureCount > 0) {
				toast.error(`Failed to delete ${failureCount} SOP${failureCount > 1 ? "s" : ""}`);
			}

			setSelectedSopIds([]);
			loadSops();
		} catch (error) {
			toast.error("Failed to delete selected SOPs");
		} finally {
			setBulkActionLoading(false);
		}
	};

	// Handle single delete
	const handleDelete = async () => {
		if (!sopToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteSOPAction(sopToDelete.id);
			if (result.success) {
				toast.success("SOP deleted successfully");
				loadSops();
				setDeleteDialogOpen(false);
				setSopToDelete(null);
			} else {
				toast.error(result.message || "Failed to delete SOP");
			}
		} catch (error) {
			toast.error("Failed to delete SOP");
		} finally {
			setDeleting(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "DRAFT":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			case "REVIEW":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "APPROVED":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "ARCHIVED":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
		return <div className="py-8 text-center">Loading SOPs...</div>;
	}

	return (
		<div className="space-y-4">
			{/* Bulk Actions Bar */}
			{selectedSopIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedSopIds.length}
					itemName="SOP"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedSopIds([])}
					actions={[
						{
							label: `Delete ${selectedSopIds.length} SOP${selectedSopIds.length > 1 ? "s" : ""}`,
							onClick: handleBulkDelete,
							variant: "destructive" as const,
							disabled: bulkActionLoading,
						},
					]}
				/>
			)}

			{/* SOPs Table */}
			{sops.length === 0 ? (
				<NoItemFound
					title="No SOPs found"
					description="Get started by creating your first standard operating procedure."
					action={
						<Button asChild>
							<Link href="/training-support/sop-library/new">Create SOP</Link>
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
										checked={selectedSopIds.length === sops.length}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Version</TableHead>
								<TableHead>Created By</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sops.map((sop) => (
								<TableRow key={sop.id}>
									<TableCell>
										<Checkbox
											checked={selectedSopIds.includes(sop.id)}
											onCheckedChange={() => toggleSelectSop(sop.id)}
											aria-label={`Select ${sop.title}`}
										/>
									</TableCell>
									<TableCell>
										<Link
											href={`/training-support/sop-library/${sop.id}`}
											className="font-medium hover:underline">
											{sop.title}
										</Link>
									</TableCell>
									<TableCell>
										<Badge className={getStatusColor(sop.status)}>{sop.status}</Badge>
									</TableCell>
									<TableCell>{sop.category || "-"}</TableCell>
									<TableCell>{sop.version || 1}</TableCell>
									<TableCell>{getUserName(sop.createdBy)}</TableCell>
									<TableCell>{formatDate(sop.updatedAt)}</TableCell>
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
													<Link href={`/training-support/sop-library/${sop.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/training-support/sop-library/${sop.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setSopToDelete(sop);
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
					itemName="SOPs"
					baseUrl="/training-support/sop-library"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete SOP"
				description={`Are you sure you want to delete "${sopToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
