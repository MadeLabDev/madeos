"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bulkUpdateUserRolesAction } from "@/lib/features/users/actions";

// Local type definition since Role model doesn't exist in Prisma schema yet
type Role = {
	id: string;
	displayName: string;
};

interface BulkUpdateRolesModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedUserIds: string[];
	onSuccess: () => void;
}

export function BulkUpdateRolesModal({ isOpen, onClose, selectedUserIds, onSuccess }: BulkUpdateRolesModalProps) {
	const [roles, setRoles] = useState<Role[]>([]);
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load roles
	useEffect(() => {
		const loadRoles = async () => {
			if (!isOpen) return;

			setIsLoading(true);
			try {
				const { getRoles } = await import("@/lib/features/roles/actions");
				const result = await getRoles();
				if (result.success && result.data) {
					setRoles(result.data.roles as Role[]);
				} else {
					toast.error("Failed to load roles");
				}
			} catch (error) {
				toast.error("Failed to load roles");
			} finally {
				setIsLoading(false);
			}
		};

		loadRoles();
	}, [isOpen]);

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedRoleId("");
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		if (!selectedRoleId) {
			toast.error("Please select a role");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await bulkUpdateUserRolesAction(selectedUserIds, selectedRoleId);
			if (result.success) {
				toast.success(result.message);
				onSuccess();
				onClose();
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to update user roles");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Roles for {selectedUserIds.length} Users</DialogTitle>
					<DialogDescription>Select a role to assign to all selected users. This will replace their current roles.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="role-select">Select Role</Label>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Loader className="h-4 w-4" />
								<span className="text-muted-foreground text-sm">Loading roles...</span>
							</div>
						) : (
							<Select
								value={selectedRoleId}
								onValueChange={setSelectedRoleId}>
								<SelectTrigger>
									<SelectValue placeholder="Choose a role..." />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem
											key={role.id}
											value={role.id}>
											{role.displayName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div className="bg-muted rounded-md p-3">
						<p className="text-muted-foreground text-sm">
							<strong>Note:</strong> This action will replace all existing roles for the selected users with the chosen role.
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!selectedRoleId || isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader className="mr-2 h-4 w-4" />
								Updating...
							</>
						) : (
							`Update ${selectedUserIds.length} Users`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
