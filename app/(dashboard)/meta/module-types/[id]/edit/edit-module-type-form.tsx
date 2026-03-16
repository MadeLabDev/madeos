"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateModuleTypeAction } from "@/lib/features/meta/actions";
import type { EditModuleTypeFormProps } from "@/lib/features/meta/types";

import { ModuleTypeForm } from "../../../components/module-type-form";

export function EditModuleTypeForm({ moduleType }: EditModuleTypeFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (formData: any) => {
		setIsSubmitting(true);
		try {
			const result = await updateModuleTypeAction(moduleType.id, formData);

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Module type updated successfully",
				});
				router.push("/meta/module-types");
			} else {
				toast.error("Error", {
					description: result.message || "Failed to update module type",
				});
			}
			return result;
		} catch (error) {
			toast.error("Error", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
			return { success: false, message: "An error occurred" };
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push("/meta/module-types");
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-module-type-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Module Type</h1>
					<p className="text-muted-foreground">Update field schema and configuration</p>
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
						Update Module Type
					</Button>
				</div>
			</div>

			{/* Form */}
			<ModuleTypeForm
				defaultValues={moduleType}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
