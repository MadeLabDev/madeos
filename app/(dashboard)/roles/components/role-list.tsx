"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { deleteRole, getRoles } from "@/lib/features/roles/actions";
import { Role, RoleListProps } from "@/lib/features/roles/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

export function RoleList({ page, search, pageSize }: RoleListProps) {
	const [roles, setRoles] = useState<Role[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Load roles function
	const loadRoles = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getRoles({
				page,
				pageSize,
				search: search || undefined,
			});
			if (result.success && result.data) {
				const data = result.data as any;
				setRoles(data.roles);
				setTotal(data.total);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load roles");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize]);

	// Load on mount and when page/search changes
	useEffect(() => {
		loadRoles();
	}, [loadRoles]);

	// Initialize Pusher
	usePusher();

	// Stable callbacks for Pusher events
	const handleRoleUpdate = useCallback(
		(eventData: any) => {
			// Unwrap data from Pusher event structure: { data: {...}, timestamp: '...' }
			const data = eventData.data || eventData;

			// Handle single role updates (updated)
			if (data.roleId) {
				setRoles((prev) => {
					const existingRole = prev.find((r) => r.id === data.roleId);
					if (!existingRole) return prev; // Role not in current page

					return prev.map((r) => {
						if (r.id === data.roleId) {
							if (data.role) {
								return { ...r, ...data.role };
							}
						}
						return r;
					});
				});
			}
			// Handle new role created
			else if (data.action === "role_created") {
				setRoles((prev) => {
					// Check if role already exists
					if (prev.find((r) => r.id === data.role.id)) {
						return prev;
					}
					// Add new role to list (will be on first page)
					if (page === 1) {
						return [data.role, ...prev];
					}
					return prev;
				});
			}
			// Handle role updated (structured data change)
			else if (data.action === "role_updated") {
				setRoles((prev) =>
					prev.map((r) => {
						if (r.id === data.role.id) {
							return { ...r, ...data.role };
						}
						return r;
					}),
				);
			}
			// Handle role deleted
			else if (data.action === "role_deleted" || data.action === "deleted") {
				setRoles((prev) => prev.filter((r) => r.id !== data.role?.id));
			}
			// Handle other events - reload list
			else {
				loadRoles();
			}
		},
		[loadRoles, page],
	);

	// Listen for role update events
	useChannelEvent("private-global", "role_update", handleRoleUpdate);

	const isSystemRole = (name: string) => {
		return ["admin", "manager", "user"].includes(name);
	};

	const handleDeleteClick = (role: Role) => {
		if (isSystemRole(role.name)) {
			toast.error("Cannot delete system roles");
			return;
		}
		setRoleToDelete(role);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!roleToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteRole(roleToDelete.id);
			if (result.success) {
				toast.success("Role deleted successfully");
				setDeleteDialogOpen(false);
				setRoleToDelete(null);
				await loadRoles();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete role");
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return <PageLoading />;
	}

	if (roles.length === 0) {
		return <NoItemFound text="No roles found" />;
	}

	return (
		<>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Display Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Type</TableHead>
							<TableHead className="w-12">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{roles.map((role) => (
							<TableRow key={role.id}>
								<TableCell className={`${isSystemRole(role.name) ? "text-red-500" : ""} font-mono text-sm`}>{role.name}</TableCell>
								<TableCell className="font-medium">{role.displayName}</TableCell>
								<TableCell className="text-muted-foreground max-w-xs truncate text-sm">{role.description || "-"}</TableCell>
								<TableCell>{isSystemRole(role.name) ? <Badge variant="secondary">System</Badge> : <Badge variant="outline">Custom</Badge>}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0">
												<span className="sr-only">Open menu</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<Link href={`/roles/${role.id}`}>
												<DropdownMenuItem>
													<Eye className="mr-2 h-4 w-4" />
													View
												</DropdownMenuItem>
											</Link>
											<Link href={`/roles/${role.id}/edit`}>
												<DropdownMenuItem>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
											</Link>
											{!isSystemRole(role.name) && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-red-600"
														onClick={() => handleDeleteClick(role)}>
														<Trash2 className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="roles"
					baseUrl="/roles"
				/>
			)}

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Role"
				description={`Are you sure you want to delete the role "${roleToDelete?.displayName}"? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
}
