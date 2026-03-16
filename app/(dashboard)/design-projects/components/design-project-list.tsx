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
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DesignProjectStatus } from "@/generated/prisma/enums";
import { bulkDeleteDesignProjects, deleteDesignProject, getDesignProjects } from "@/lib/features/design/actions";
import { DesignProjectWithRelations } from "@/lib/features/design/types";
import { getUsersAction } from "@/lib/features/users/actions";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";
import { formatDate } from "@/lib/utils";

interface DesignProjectListProps {
	search?: string;
	statusFilter?: string;
	page?: number;
	pageSize?: number;
}

export function DesignProjectList({ search = "", statusFilter = "ALL", page = 1, pageSize = 20 }: DesignProjectListProps) {
	const [designProjects, setDesignProjects] = useState<DesignProjectWithRelations[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [designProjectToDelete, setDesignProjectToDelete] = useState<DesignProjectWithRelations | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Checkbox selection state
	const [selectedDesignProjectIds, setSelectedDesignProjectIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);
	const [users, setUsers] = useState<any[]>([]);

	// Initialize Pusher
	usePusher();

	// Subscribe to design project updates
	useChannelEvent("private-global", "design_project_update", (data: any) => {
		const { action } = data;
		if (action === "design_project_created" || action === "design_project_updated" || action === "design_project_deleted") {
			loadDesignProjects();
		}
	});

	// Load design projects function
	const loadDesignProjects = useCallback(async () => {
		setLoading(true);
		try {
			const filters = {
				...(statusFilter !== "ALL" && { status: statusFilter as DesignProjectStatus }),
			};
			const result = await getDesignProjects(filters);
			if (result.success && result.data) {
				let filteredDesignProjects = result.data;

				// Client-side search filtering
				if (search) {
					filteredDesignProjects = filteredDesignProjects.filter((designProject) => designProject.title.toLowerCase().includes(search.toLowerCase()) || (designProject.description && designProject.description.toLowerCase().includes(search.toLowerCase())));
				}

				// Set total for pagination
				setTotal(filteredDesignProjects.length);

				// Client-side pagination
				const startIndex = (page - 1) * pageSize;
				const endIndex = startIndex + pageSize;
				const paginatedDesignProjects = filteredDesignProjects.slice(startIndex, endIndex);

				setDesignProjects(paginatedDesignProjects);
			} else {
				toast.error("Failed to load design projects");
				setDesignProjects([]);
				setTotal(0);
			}
		} catch (error) {
			toast.error("Failed to load design projects");
			setDesignProjects([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [search, statusFilter, page, pageSize]);

	// Load users function
	const loadUsers = useCallback(async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	}, []);

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	// Load data on mount and when filters change
	useEffect(() => {
		loadDesignProjects();
		loadUsers();
	}, [loadDesignProjects, loadUsers]);

	// Handle delete
	const handleDelete = async () => {
		if (!designProjectToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteDesignProject(designProjectToDelete.id);
			if (result.success) {
				toast.success("Design project deleted successfully");
				loadDesignProjects();
				setDeleteDialogOpen(false);
				setDesignProjectToDelete(null);
			} else {
				toast.error(result.message || "Failed to delete design project");
			}
		} catch (error) {
			toast.error("Failed to delete design project");
		} finally {
			setDeleting(false);
		}
	};

	// Bulk actions
	const toggleSelectAll = () => {
		if (selectedDesignProjectIds.length === designProjects.length) {
			setSelectedDesignProjectIds([]);
		} else {
			setSelectedDesignProjectIds(designProjects.map((project) => project.id));
		}
	};

	const toggleSelectDesignProject = (designProjectId: string) => {
		setSelectedDesignProjectIds((prev) => (prev.includes(designProjectId) ? prev.filter((id) => id !== designProjectId) : [...prev, designProjectId]));
	};

	// Handle bulk delete
	const handleBulkDelete = async () => {
		if (selectedDesignProjectIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteDesignProjects(selectedDesignProjectIds);
			if (result.success) {
				toast.success(`Successfully deleted ${result.data?.deletedCount || selectedDesignProjectIds.length} design projects`);
				setSelectedDesignProjectIds([]);
				loadDesignProjects();
			} else {
				toast.error(result.message || "Failed to delete design projects");
			}
		} catch (error) {
			toast.error("Failed to delete design projects");
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
			{selectedDesignProjectIds.length > 0 && (
				<BulkActionsBar
					selectedCount={selectedDesignProjectIds.length}
					itemName="design project"
					isLoading={bulkActionLoading}
					onClear={() => setSelectedDesignProjectIds([])}
					actions={[
						{
							label: "Delete Selected",
							onClick: handleBulkDelete,
							variant: "destructive" as const,
						},
					]}
				/>
			)}

			{/* Design Projects Grid */}
			{designProjects.length === 0 ? (
				<NoItemFound
					title="No design projects found"
					description="Get started by creating your first design project."
					action={
						<Button asChild>
							<Link href="/design-projects/projects/new">Create Design Project</Link>
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
										checked={selectedDesignProjectIds.length === designProjects.length}
										onCheckedChange={toggleSelectAll}
										aria-label="Select all"
									/>
								</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Requested By</TableHead>
								<TableHead>Assigned To</TableHead>
								<TableHead>Due Date</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{designProjects.map((designProject) => (
								<TableRow key={designProject.id}>
									<TableCell>
										<Checkbox
											checked={selectedDesignProjectIds.includes(designProject.id)}
											onCheckedChange={() => toggleSelectDesignProject(designProject.id)}
											aria-label={`Select ${designProject.title}`}
										/>
									</TableCell>
									<TableCell className="font-medium">{designProject.title}</TableCell>
									<TableCell>
										<Badge variant={designProject.status === "APPROVED" ? "default" : designProject.status === "DRAFT" ? "secondary" : designProject.status === "COMPLETED" ? "outline" : "outline"}>{designProject.status}</Badge>
									</TableCell>
									<TableCell>
										<Badge variant={designProject.priority === "HIGH" ? "destructive" : designProject.priority === "MEDIUM" ? "default" : "secondary"}>{designProject.priority || "LOW"}</Badge>
									</TableCell>
									<TableCell>{designProject.requestedBy ? getUserName(designProject.requestedBy) : "Unknown"}</TableCell>
									<TableCell>{designProject.assignedTo ? getUserName(designProject.assignedTo) : "Unassigned"}</TableCell>
									<TableCell>{designProject.dueDate ? formatDate(designProject.dueDate) : "No due date"}</TableCell>
									<TableCell>{new Date(designProject.createdAt).toLocaleDateString()}</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/projects/${designProject.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/design-projects/projects/${designProject.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => {
														setDesignProjectToDelete(designProject);
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
					itemName="design projects"
					baseUrl="/design-projects/projects"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Design Project"
				description={`Are you sure you want to delete "${designProjectToDelete?.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
