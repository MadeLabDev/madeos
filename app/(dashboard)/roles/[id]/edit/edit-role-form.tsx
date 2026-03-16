"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateRole } from "@/lib/features/roles/actions";
import type { RoleFormmProps } from "@/lib/features/roles/types";

import { RoleForm } from "../../components/role-form";

export function EditRoleForm({ role }: { role: RoleFormmProps }) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (data: any) => {
		setIsSubmitting(true);
		try {
			return await updateRole(role.id, data);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push(`/roles/${role.id}`);
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
					<h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
					<p className="text-muted-foreground">Update role details and permissions</p>
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
						Update Role
					</Button>
				</div>
			</div>

			{/* Form */}
			<RoleForm
				role={role}
				title={`Edit Role: ${role.displayName}`}
				submitButtonText="Update Role"
				onSubmit={handleSubmit}
				redirectPath={`/roles/${role.id}`}
				hideButtons
			/>
		</div>
	);
}
