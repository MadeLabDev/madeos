"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateUserGroupAction } from "@/lib/features/user-groups/actions";
import { UserGroupWithMembers } from "@/lib/features/user-groups/types";

import { UserGroupForm } from "../../components/user-group-form";

interface EditUserGroupFormProps {
	userGroup: UserGroupWithMembers;
}

export function EditUserGroupForm({ userGroup }: EditUserGroupFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleUpdateUserGroup(data: { name: string; description?: string }) {
		setIsSubmitting(true);
		try {
			const result = await updateUserGroupAction(userGroup.id, data);

			if (result.success) {
				toast.success(result.message);
				router.push(`/user-groups/${userGroup.id}`);
			}
			return result;
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		router.push(`/user-groups/${userGroup.id}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-user-group-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit User Group</h1>
					<p className="text-muted-foreground">Update user group information</p>
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
						Update Group
					</Button>
				</div>
			</div>

			{/* Form */}
			<UserGroupForm
				userGroup={userGroup}
				onSubmit={handleUpdateUserGroup}
				onCancel={handleCancel}
				isEditing={true}
				hideButtons={true}
			/>
		</div>
	);
}
