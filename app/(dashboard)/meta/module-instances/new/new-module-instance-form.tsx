"use client";

import { useState } from "react";
import { useEffect } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createModuleInstanceAction, getModuleTypesAction } from "@/lib/features/meta/actions";
import { ModuleTypeDetail } from "@/lib/features/meta/types";

import { ModuleInstanceForm } from "../../components/module-instance-form";

export function NewModuleInstanceForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [moduleTypes, setModuleTypes] = useState<ModuleTypeDetail[]>([]);
	const [selectedModuleTypeId, setSelectedModuleTypeId] = useState<string>("");
	const [isLoadingModuleTypes, setIsLoadingModuleTypes] = useState(true);

	useEffect(() => {
		const loadModuleTypes = async () => {
			try {
				const result = await getModuleTypesAction({ page: 1, pageSize: 1000 });
				if (result.success && result.data) {
					const data = result.data as any;
					setModuleTypes(data.moduleTypes || []);
					if ((data.moduleTypes || []).length > 0) {
						setSelectedModuleTypeId((data.moduleTypes || [])[0].id);
					}
				}
			} catch (error) {
				toast.error("Failed to load module types");
			} finally {
				setIsLoadingModuleTypes(false);
			}
		};
		loadModuleTypes();
	}, []);

	const selectedModuleType = moduleTypes.find((mt) => mt.id === selectedModuleTypeId);

	const handleSubmit = async (fieldValues: Record<string, any>, entityId: string, entityName: string) => {
		setIsSubmitting(true);
		try {
			const result = await createModuleInstanceAction({
				moduleTypeId: selectedModuleTypeId,
				entityId,
				entityName,
				fieldValues,
			});

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Module instance created successfully",
				});
				router.push("/meta/module-instances");
			} else {
				toast.error("Error", {
					description: result.message || "Failed to create module instance",
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

	if (isLoadingModuleTypes) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader size="md" />
			</div>
		);
	}

	if (!selectedModuleType) {
		return (
			<div className="rounded-md border border-red-200 bg-red-50 p-4">
				<p className="text-sm text-red-700">No module types available. Create a module type first.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create New Module Instance</h1>
					<p className="text-muted-foreground">Add instance data for {selectedModuleType.name}</p>
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
						Create Instance
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
					moduleTypes={moduleTypes}
					hideButtons
				/>
			)}
		</div>
	);
}
