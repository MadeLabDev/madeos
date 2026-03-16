"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createUserGroupAction } from "@/lib/features/user-groups/actions";

import { UserGroupForm } from "../components";

export function NewUserGroupForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleCreateUserGroup(data: { name: string; description?: string }) {
		setIsSubmitting(true);
		try {
			const result = await createUserGroupAction(data);

			if (result.success) {
				toast.success(result.message);
				router.push("/user-groups");
			}
			return result;
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		router.push("/user-groups");
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
					<h1 className="text-3xl font-bold tracking-tight">Create User Group</h1>
					<p className="text-muted-foreground">Create a new user group to organize users</p>
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
						Create Group
					</Button>
				</div>
			</div>

			{/* Form */}
			<UserGroupForm
				onSubmit={handleCreateUserGroup}
				onCancel={handleCancel}
				hideButtons={true}
			/>
		</div>
	);
}
