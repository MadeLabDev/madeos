"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateUserAction, updateUserRolesAction } from "@/lib/features/users/actions";
import { EditUserFormProps } from "@/lib/features/users/types";

import { UserForm } from "../../components/user-form";

export function EditUserForm({ userId, user, roles }: EditUserFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleUpdateUser(data: { email: string; username?: string; name?: string; password?: string; roleIds: string[] }) {
		setIsSubmitting(true);
		try {
			// Update basic info
			const updateData: any = {
				email: data.email,
				name: data.name,
			};

			// Add username if provided
			if (data.username && data.username.trim() !== "") {
				updateData.username = data.username;
			}

			// Only include password if provided
			if (data.password && data.password.trim() !== "") {
				updateData.password = data.password;
			}

			const result = await updateUserAction(userId, updateData);

			if (result.success) {
				// Update roles - will set to default "user" role if none selected
				await updateUserRolesAction(userId, data.roleIds && data.roleIds.length > 0 ? data.roleIds : []);
				toast.success(result.message || "User updated successfully");
				router.push(`/users/${userId}`);
			}

			return result;
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		router.push(`/users/${userId}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		// Trigger form submit by finding and clicking the submit button inside form
		const submitBtn = document.querySelector('form[data-user-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
					<p className="text-muted-foreground">Update user information and roles</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Update User
					</Button>
				</div>
			</div>

			{/* Form */}
			<UserForm
				user={user}
				roles={roles}
				onSubmit={handleUpdateUser}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
