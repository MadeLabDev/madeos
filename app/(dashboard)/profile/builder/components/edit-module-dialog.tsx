"use client";

import { useCallback, useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ModuleFormField } from "@/components/module-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAvailableModuleTypesAction, updateModuleAction } from "@/lib/features/profile/actions";
import type { EditModuleDialogProps, FieldDefinition, ProfileModuleType } from "@/lib/features/profile/types";

export function EditModuleDialog({ open, onOpenChange, module, profileId, onModuleUpdated }: EditModuleDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [moduleType, setModuleType] = useState<ProfileModuleType | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { control, handleSubmit, reset } = useForm<Record<string, any>>({
		mode: "onBlur",
		defaultValues: {},
	});

	const loadModuleTypeSchema = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await getAvailableModuleTypesAction();

			if (result.success && result.data) {
				const types = Array.isArray(result.data) ? result.data : [result.data];
				const foundType = types.find((t: ProfileModuleType) => t.id === module.moduleTypeId);
				if (foundType) {
					setModuleType(foundType);
				}
			}
		} catch (error) {
			console.error("Error loading module type:", error);
			toast.error("Failed to load module form");
		} finally {
			setIsLoading(false);
		}
	}, [module.moduleTypeId]);

	// Load module type schema when dialog opens
	useEffect(() => {
		if (open && module.moduleTypeId) {
			// Always load when dialog opens, even if we have moduleType cached
			loadModuleTypeSchema();
		}

		if (!open) {
			setModuleType(null);
		}
	}, [open, module.moduleTypeId, loadModuleTypeSchema]);

	// Reset form when moduleType changes or module data changes or dialog opens
	useEffect(() => {
		if (moduleType && open) {
			const fields = ((moduleType.fieldSchema as any)?.fields || []) as FieldDefinition[];
			const defaultValues: Record<string, any> = {};

			fields.forEach((field) => {
				// Get the current value or use appropriate default based on field type
				const currentValue = module.data?.[field.name];

				if (currentValue !== undefined && currentValue !== null) {
					// Preserve existing value
					defaultValues[field.name] = currentValue;
				} else {
					// Use type-appropriate default
					if (["tags", "multiselect", "checkbox"].includes(field.type)) {
						defaultValues[field.name] = [];
					} else if (["file", "image"].includes(field.type)) {
						defaultValues[field.name] = null;
					} else {
						defaultValues[field.name] = "";
					}
				}
			});

			reset(defaultValues);
		}
	}, [moduleType, open, module.id, module.data, reset]);

	const handleSave = async (data: Record<string, any>) => {
		try {
			setIsSubmitting(true);

			const result = await updateModuleAction(profileId, module.id, {
				data,
			});

			if (result.success) {
				toast.success("Module updated successfully");
				onModuleUpdated?.(module.id, { data });
				onOpenChange(false);
			} else {
				toast.error(result.message || "Failed to update module");
			}
		} catch (error) {
			toast.error("An error occurred");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const fields = moduleType ? (((moduleType.fieldSchema as any)?.fields || []) as FieldDefinition[]).sort((a, b) => a.order - b.order) : [];

	return (
		<Dialog
			key={`${module.id}-${open}`}
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{moduleType?.name || "Edit Module"}</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<p className="text-muted-foreground py-8 text-sm">Loading form...</p>
				) : (
					<form
						onSubmit={handleSubmit(handleSave)}
						className="space-y-4">
						<div className="space-y-4 py-4">
							{fields.map((field) => (
								<ModuleFormField
									key={field.id}
									field={field}
									control={control}
									name={field.name as any}
								/>
							))}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}>
								{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
								{isSubmitting ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
