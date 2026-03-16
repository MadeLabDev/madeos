"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateModuleInstanceAction } from "@/lib/features/meta/actions";
import type { EditModuleInstanceFormProps } from "@/lib/features/meta/types";
import type { ModuleTypeDetail } from "@/lib/features/meta/types";

import { ModuleInstanceForm } from "../../../components/module-instance-form";

export function EditModuleInstanceForm({ instance, moduleTypes: mt = [] }: EditModuleInstanceFormProps & { moduleTypes?: ModuleTypeDetail[] }) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedModuleTypeId, setSelectedModuleTypeId] = useState(instance?.moduleTypeId);

	const selectedModuleType = mt.find((m) => m.id === selectedModuleTypeId);

	const handleSubmit = async (fieldValues: Record<string, any>) => {
		setIsSubmitting(true);
		try {
			const result = await updateModuleInstanceAction(instance.id, {
				fieldValues,
				isActive: instance.isActive,
			});

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Module instance updated successfully",
				});
				router.push("/meta/module-instances");
			} else {
				toast.error("Error", {
					description: result.message || "Failed to update module instance",
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
		router.push("/meta/module-instances");
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-module-instance-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	if (!selectedModuleType) {
		return (
			<div className="rounded-md border border-red-200 bg-red-50 p-4">
				<p className="text-sm text-red-700">Module type not found.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Module Instance</h1>
					<p className="text-muted-foreground">Update instance data for {selectedModuleType.name}</p>
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
						Update Instance
					</Button>
				</div>
			</div>

			{/* Form */}
			{selectedModuleType && (
				<ModuleInstanceForm
					moduleType={selectedModuleType}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					selectedModuleTypeId={selectedModuleTypeId}
					onModuleTypeChange={setSelectedModuleTypeId}
					moduleTypes={mt}
					defaultValues={{
						entityId: instance?.entityId,
						entityName: instance?.entityName,
						fieldValues: instance?.fieldValues,
					}}
					hideButtons
				/>
			)}
		</div>
	);
}
