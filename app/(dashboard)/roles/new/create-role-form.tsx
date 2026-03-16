"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createRole } from "@/lib/features/roles/actions";

import { RoleForm } from "../components";

export function CreateRoleForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCreateRole = async (data: any) => {
		setIsSubmitting(true);
		try {
			const result = await createRole(data);
			if (result.success) {
				router.push("/roles");
			}
			return result;
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push("/roles");
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-role-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
					<p className="text-muted-foreground">Add a new role to the system</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="h-4 w-4" />
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
						<Save className="mr-2 h-4 w-4" />
						Create Role
					</Button>
				</div>
			</div>

			{/* Form */}
			<RoleForm
				title="Create New Role"
				submitButtonText="Create Role"
				onSubmit={handleCreateRole}
				redirectPath="/roles"
				hideButtons
			/>
		</div>
	);
}
