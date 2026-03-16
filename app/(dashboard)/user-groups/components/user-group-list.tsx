"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { NoItemFound } from "@/components/no-item/no-item-found";
import { Pagination } from "@/components/pagination/pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkDeleteUserGroupsAction, deleteUserGroupAction, getUserGroupsAction } from "@/lib/features/user-groups/actions";
import { UserGroupListProps } from "@/lib/features/user-groups/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

// Local type definition since UserGroup model doesn't exist in Prisma schema yet
type UserGroup = {
	id: string;
	name: string;
	description?: string;
	createdAt: Date;
	_count?: {
		members: number;
	};
};

export function UserGroupList({ page, search, pageSize }: UserGroupListProps) {
	const [userGroups, setUserGroups] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userGroupToDelete, setUserGroupToDelete] = useState<UserGroup | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk selection state
	const [selectedUserGroupIds, setSelectedUserGroupIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load user groups function (defined early so callbacks can reference it)
	const loadUserGroups = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getUserGroupsAction({ page, search, pageSize });
			if (result.success && result.data) {
				const data = result.data as { userGroups: UserGroup[]; total: number };
				setUserGroups(data.userGroups);
				setTotal(data.total);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load user groups");
		} finally {
			setLoading(false);
		}
	}, [page, search, pageSize]);

	// Load on mount and when page/search changes
	useEffect(() => {
		loadUserGroups();
		setSelectedUserGroupIds([]);
	}, [loadUserGroups]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleUserGroupUpdate = useCallback(
		(eventData: any) => {
			// Unwrap data from Pusher event structure: { data: {...}, timestamp: '...' }
			const data = eventData.data || eventData;

			// Handle new user group created
			if (data.action === "user_group_created") {
				setUserGroups((prev) => {
					// Check if user group already exists
					if (prev.find((ug) => ug.id === data.userGroup.id)) {
						return prev;
					}
					// Add new user group to list (will be on first page)
					if (page === 1) {
						return [data.userGroup, ...prev];
					}
					return prev;
				});
			}
			// Handle user group updated
			else if (data.action === "user_group_updated") {
				setUserGroups((prev) =>
					prev.map((ug) => {
						if (ug.id === data.userGroup.id) {
							return { ...ug, ...data.userGroup };
						}
						return ug;
					}),
				);
			}
			// Handle user group deleted
			else if (data.action === "user_group_deleted" || data.action === "deleted") {
				setUserGroups((prev) => prev.filter((ug) => ug.id !== data.userGroup?.id));
			}
			// Handle other events - reload list
			else {
				loadUserGroups();
			}
		},
		[loadUserGroups, page],
	);

	// Listen for user group update events
	useChannelEvent("private-global", "user_group_update", handleUserGroupUpdate);

	async function handleDeleteUserGroup() {
		if (!userGroupToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteUserGroupAction(userGroupToDelete.id);
			if (result.success) {
				toast.success(result.message);
				setDeleteDialogOpen(false);
				setUserGroupToDelete(null);
				await loadUserGroups();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete user group");
		} finally {
			setDeleting(false);
		}
	}

	// Bulk actions
	const toggleSelectAll = () => {
		if (selectedUserGroupIds.length === userGroups.length) {
			setSelectedUserGroupIds([]);
		} else {
			setSelectedUserGroupIds(userGroups.map((ug) => ug.id));
		}
	};

	const toggleSelectUserGroup = (userGroupId: string) => {
		setSelectedUserGroupIds((prev) => (prev.includes(userGroupId) ? prev.filter((id) => id !== userGroupId) : [...prev, userGroupId]));
	};

	const handleBulkDelete = async () => {
		if (selectedUserGroupIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedUserGroupIds.length} user group(s)?`)) {
			return;
		}

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteUserGroupsAction(selectedUserGroupIds);
			if (result.success) {
				toast.success(result.message);
				setSelectedUserGroupIds([]);
				await loadUserGroups();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete user groups");
		} finally {
			setBulkActionLoading(false);
		}
	};

	if (loading) {
		return <PageLoading />;
	}

	if (userGroups.length === 0) {
		return (
			<NoItemFound
				icon={Users}
				title="No user groups found"
				description={search ? "Try adjusting your search criteria" : "Get started by creating your first user group"}
				action={
					<Button asChild>
						<Link href="/user-groups/new">Create User Group</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedUserGroupIds.length}
				itemName="user group"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedUserGroupIds([])}
			/>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selectedUserGroupIds.length === userGroups.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Members</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{userGroups.map((userGroup) => (
							<TableRow key={userGroup.id}>
								<TableCell>
									<Checkbox
										checked={selectedUserGroupIds.includes(userGroup.id)}
										onCheckedChange={() => toggleSelectUserGroup(userGroup.id)}
										aria-label={`Select ${userGroup.name}`}
									/>
								</TableCell>
								<TableCell className="font-medium">{userGroup.name}</TableCell>
								<TableCell>{userGroup.description || "—"}</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Users className="text-muted-foreground h-4 w-4" />
										<span>{userGroup._count?.members || 0}</span>
									</div>
								</TableCell>
								<TableCell>{new Date(userGroup.createdAt).toLocaleDateString()}</TableCell>
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
												<Link href={`/user-groups/${userGroup.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/user-groups/${userGroup.id}/edit`}>
													<Pencil className="mr-2 h-4 w-4" />
													Edit
												</Link>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-error"
												onClick={() => {
													setUserGroupToDelete(userGroup);
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

			{/* Pagination */}
			{total > 0 && (
				<Pagination
					page={page}
					total={total}
					pageSize={pageSize}
					search={search}
					itemName="user groups"
					baseUrl="/user-groups"
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete User Group"
				description={`Are you sure you want to delete "${userGroupToDelete?.name}"? This will remove all users from this group.`}
				isDeleting={deleting}
				onConfirm={handleDeleteUserGroup}
			/>
		</>
	);
}
