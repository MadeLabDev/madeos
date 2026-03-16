"use client";

import { useState } from "react";

import { Calendar, Pencil, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removeUserFromGroupAction } from "@/lib/features/user-groups/actions";
import { UserGroupDetailProps } from "@/lib/features/user-groups/types";

import { AssignUsersToGroupModal } from "./assign-users-to-group-modal";
import { UserGroupMemberList } from "./user-group-member-list";

interface UserGroupDetailWithPaginationProps extends UserGroupDetailProps {
	page: number;
	search: string;
	pageSize: number;
}

export function UserGroupDetail({ userGroup, page, search, pageSize }: UserGroupDetailWithPaginationProps) {
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [removingUserId, setRemovingUserId] = useState<string | null>(null);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);

	const handleRemoveUser = async () => {
		if (!removingUserId) return;

		try {
			const result = await removeUserFromGroupAction(userGroup.id, removingUserId);
			if (result.success) {
				toast.success("User removed from group successfully");
				// Refresh the page to show updated data
				window.location.reload();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to remove user from group");
		} finally {
			setShowRemoveDialog(false);
			setRemovingUserId(null);
		}
	};

	const openRemoveDialog = (userId: string) => {
		setRemovingUserId(userId);
		setShowRemoveDialog(true);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{userGroup.name}</h1>
					{userGroup.description && <p className="text-muted-foreground mt-1">{userGroup.description}</p>}
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setShowAssignModal(true)}>
						<UserPlus className="mr-2 h-4 w-4" />
						Assign Users
					</Button>
					<Button asChild>
						<Link href={`/user-groups/${userGroup.id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Group
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Members</CardTitle>
						<Users className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{userGroup.members.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Created</CardTitle>
						<Calendar className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{new Date(userGroup.createdAt).toLocaleDateString()}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Last Updated</CardTitle>
						<Calendar className="text-muted-foreground h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{new Date(userGroup.updatedAt).toLocaleDateString()}</div>
					</CardContent>
				</Card>
			</div>

			{/* Members List Component */}
			<UserGroupMemberList
				groupId={userGroup.id}
				page={page}
				search={search}
				pageSize={pageSize}
				onRemoveUser={openRemoveDialog}
			/>

			{/* Assign Users Modal */}
			<AssignUsersToGroupModal
				isOpen={showAssignModal}
				onClose={() => setShowAssignModal(false)}
				userGroup={userGroup}
			/>

			{/* Remove User Confirmation Dialog */}
			<AlertDialog
				open={showRemoveDialog}
				onOpenChange={setShowRemoveDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove User from Group</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to remove this user from the group? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleRemoveUser}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Remove User
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
