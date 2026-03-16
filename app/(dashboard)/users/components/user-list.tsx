"use client";

import { useCallback, useEffect, useState } from "react";

import { CheckCircle2, Eye, Mail, MoreHorizontal, Pencil, Trash2, UserCheck, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { BulkActionsBar } from "@/components/bulk-actions/bulk-actions-bar";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Pagination } from "@/components/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageLoading } from "@/components/ui/page-loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bulkActivateUsersAction, bulkDeleteUsersAction, bulkResendActivationEmailsAction, deleteUserAction, getUsersAction, resendActivationEmailAction } from "@/lib/features/users/actions";
import { User, UserListProps } from "@/lib/features/users/types";
import { useChannelEvent, usePusher } from "@/lib/hooks/use-pusher";

import { ActivateUserButton } from "./activate-user-button";
import { BulkUpdateRolesModal } from "./bulk-update-roles-modal";

export function UserList({ page, search, roleId, pageSize }: UserListProps) {
	const [users, setUsers] = useState<User[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Bulk update roles modal state
	const [showBulkUpdateRolesModal, setShowBulkUpdateRolesModal] = useState(false);

	// Bulk selection state
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
	const [bulkActionLoading, setBulkActionLoading] = useState(false);

	// Load users function (defined early so callbacks can reference it)
	const loadUsers = useCallback(async () => {
		setLoading(true);
		try {
			const result = await getUsersAction({ page, search, roleId, pageSize });
			if (result.success && result.data) {
				const data = result.data as { users: User[]; total: number };
				setUsers(data.users);
				setTotal(data.total);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [page, search, roleId, pageSize]);

	// Load on mount and when page/search changes
	useEffect(() => {
		loadUsers();
		setSelectedUserIds([]);
	}, [loadUsers]);

	// Pusher subscription
	usePusher();

	// Stable callbacks for Pusher events
	const handleUserUpdate = useCallback(
		(eventData: any) => {
			// Unwrap data from Pusher event structure: { data: {...}, timestamp: '...' }
			const data = eventData.data || eventData;

			// Handle single user updates (activate/deactivate/update)
			if (data.userId) {
				// Single user update (activated/deactivated/updated)
				setUsers((prev) => {
					const existingUser = prev.find((u) => u.id === data.userId);
					if (!existingUser) return prev; // User not in current page

					return prev.map((u) => {
						if (u.id === data.userId) {
							// Update user properties
							if (data.user) {
								return { ...u, ...data.user };
							}
						}
						return u;
					});
				});
			}
			// Handle new user created
			else if (data.action === "user_created") {
				setUsers((prev) => {
					// Check if user already exists
					if (prev.find((u) => u.id === data.user.id)) {
						return prev;
					}
					// Add new user to list (will be on first page)
					// Only add if we're on the first page and have space
					if (page === 1) {
						return [data.user, ...prev];
					}
					return prev;
				});
			}
			// Handle user updated (structured data change)
			else if (data.action === "user_updated") {
				setUsers((prev) =>
					prev.map((u) => {
						if (u.id === data.user.id) {
							return { ...u, ...data.user };
						}
						return u;
					}),
				);
			}
			// Handle bulk deletions
			else if (data.action === "deleted") {
				setUsers((prev) => prev.filter((u) => u.id !== data.user?.id));
			}
			// Handle other events - reload list
			else {
				loadUsers();
			}
		},
		[loadUsers, page],
	);

	// Listen for user update events (single subscription)
	useChannelEvent("private-global", "user_update", handleUserUpdate);

	async function handleDeleteUser() {
		if (!userToDelete) return;

		setDeleting(true);
		try {
			const result = await deleteUserAction(userToDelete.id);
			if (result.success) {
				toast.success(result.message);
				setDeleteDialogOpen(false);
				setUserToDelete(null);
				await loadUsers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete user");
		} finally {
			setDeleting(false);
		}
	}

	// Bulk actions
	const toggleSelectAll = () => {
		if (selectedUserIds.length === users.length) {
			setSelectedUserIds([]);
		} else {
			// Only select non-admin users
			const nonAdminIds = users.filter((u) => !u.userRoles.some((ur) => ur.role.name === "admin")).map((u) => u.id);
			setSelectedUserIds(nonAdminIds);
		}
	};

	const toggleSelectUser = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		// Prevent selecting admin users
		if (user?.userRoles.some((ur) => ur.role.name === "admin")) {
			return;
		}

		setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
	};

	const handleBulkDelete = async () => {
		if (selectedUserIds.length === 0) return;

		if (!confirm(`Are you sure you want to delete ${selectedUserIds.length} user(s)?`)) {
			return;
		}

		setBulkActionLoading(true);
		try {
			const result = await bulkDeleteUsersAction(selectedUserIds);
			if (result.success) {
				toast.success(result.message);
				setSelectedUserIds([]);
				await loadUsers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to delete users");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkActivate = async () => {
		if (selectedUserIds.length === 0) return;

		setBulkActionLoading(true);
		try {
			const result = await bulkActivateUsersAction(selectedUserIds);
			if (result.success) {
				toast.success(result.message);
				setSelectedUserIds([]);
				await loadUsers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to activate users");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleBulkUpdateRoles = () => {
		if (selectedUserIds.length === 0) return;
		setShowBulkUpdateRolesModal(true);
	};

	const handleBulkUpdateRolesSuccess = () => {
		setSelectedUserIds([]);
		loadUsers();
	};

	const handleBulkResendActivation = async () => {
		if (selectedUserIds.length === 0) return;

		// Filter only inactive users
		const inactiveUsers = users.filter((u) => selectedUserIds.includes(u.id) && !u.isActive);

		if (inactiveUsers.length === 0) {
			toast.warning("No inactive users selected");
			return;
		}

		if (!confirm(`Are you sure you want to resend activation emails to ${inactiveUsers.length} user(s)?`)) {
			return;
		}

		setBulkActionLoading(true);
		try {
			const result = await bulkResendActivationEmailsAction(inactiveUsers.map((u) => u.id));
			if (result.success) {
				toast.success(result.message);
				setSelectedUserIds([]);
				await loadUsers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to resend activation emails");
		} finally {
			setBulkActionLoading(false);
		}
	};

	const handleResendActivationEmail = async (userId: string, userEmail: string) => {
		try {
			const result = await resendActivationEmailAction(userId);
			if (result.success) {
				toast.success(`Activation email sent to ${userEmail}`);
				await loadUsers();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to resend activation email");
		}
	};

	// Helper function to check if activation token is expired
	const isActivationExpired = (user: User) => {
		if (user.isActive || !user.activationTokenExpiry) return false;
		return new Date(user.activationTokenExpiry) < new Date();
	};

	if (loading) {
		return <PageLoading />;
	}

	if (users.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">No users found</p>
				{search && (
					<Link href="/users">
						<Button variant="link">
							<X className="mr-2 h-4 w-4" />
							Clear search
						</Button>
					</Link>
				)}
			</div>
		);
	}

	return (
		<>
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedUserIds.length}
				itemName="user"
				isLoading={bulkActionLoading}
				actions={[
					{
						label: "Update Roles",
						icon: UserCheck,
						onClick: handleBulkUpdateRoles,
						variant: "outline",
					},
					{
						label: "Resend Activation",
						icon: Mail,
						onClick: handleBulkResendActivation,
						variant: "outline",
					},
					{
						label: "Activate Selected",
						icon: CheckCircle2,
						onClick: handleBulkActivate,
						variant: "outline",
					},
					{
						label: "Delete Selected",
						icon: Trash2,
						onClick: handleBulkDelete,
						variant: "destructive",
					},
				]}
				onClear={() => setSelectedUserIds([])}
			/>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[50px]">
								<Checkbox
									checked={selectedUserIds.length === users.length}
									onCheckedChange={toggleSelectAll}
									aria-label="Select all"
								/>
							</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Roles</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => {
							const isAdmin = user.userRoles.some((ur) => ur.role.name === "admin");
							const isExpired = isActivationExpired(user);
							return (
								<TableRow key={user.id}>
									<TableCell>
										<Checkbox
											checked={selectedUserIds.includes(user.id)}
											onCheckedChange={() => toggleSelectUser(user.id)}
											disabled={isAdmin}
											aria-label={`Select ${user.email}`}
										/>
									</TableCell>
									<TableCell className="font-medium">{user.email}</TableCell>
									<TableCell>{user.name || "—"}</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											{user.isActive ? (
												<Badge
													variant="default"
													className="w-fit bg-green-600 text-white">
													Active
												</Badge>
											) : (
												<>
													<Badge
														variant="outline"
														className="w-fit text-orange-600">
														Pending
													</Badge>
													{isExpired && (
														<Badge
															variant="destructive"
															className="w-fit text-xs">
															Link Expired
														</Badge>
													)}
												</>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{user.userRoles.length === 0 ? (
												<Badge
													variant="outline"
													className="text-muted-foreground">
													No roles
												</Badge>
											) : (
												user.userRoles.map((ur) => (
													<Badge
														key={ur.role.id}
														variant="secondary">
														{ur.role.displayName}
													</Badge>
												))
											)}
										</div>
									</TableCell>
									<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
													<Link href={`/users/${user.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/users/${user.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												{!user.userRoles.some((ur) => ur.role.name === "admin") && (
													<>
														{!user.isActive && (
															<>
																<DropdownMenuSeparator />
																<DropdownMenuItem onClick={() => handleResendActivationEmail(user.id, user.email)}>
																	<Mail className="mr-2 h-4 w-4" />
																	Resend Activation
																</DropdownMenuItem>
															</>
														)}
														<DropdownMenuSeparator />
														<div className="p-1">
															<ActivateUserButton
																userId={user.id}
																userEmail={user.email}
																isActive={user.isActive}
																variant="outline"
																className="w-full"
															/>
														</div>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-error"
															onClick={() => {
																setUserToDelete(user);
																setDeleteDialogOpen(true);
															}}>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
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
					itemName="users"
					baseUrl="/users"
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete User"
				description={`Are you sure you want to delete ${userToDelete?.email}? This action cannot be undone.`}
				isDeleting={deleting}
				onConfirm={handleDeleteUser}
			/>

			{/* Bulk Update Roles Modal */}
			<BulkUpdateRolesModal
				isOpen={showBulkUpdateRolesModal}
				onClose={() => setShowBulkUpdateRolesModal(false)}
				selectedUserIds={selectedUserIds}
				onSuccess={handleBulkUpdateRolesSuccess}
			/>
		</>
	);
}
