"use client";

import { useEffect, useState } from "react";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ModuleFormField } from "@/components/module-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Loader from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ModuleTypeDetail } from "@/lib/features/meta/types/meta.types";
import { getMetaSystemModuleTypesAction, updateProfileAction } from "@/lib/features/profile/actions";
import type { FieldDefinition, ProfileBuilderFormProps } from "@/lib/features/profile/types";

type GroupedModuleFields = {
	moduleType: ModuleTypeDetail;
	fields: FieldDefinition[];
};

export function ProfileForm({ profile, onProfileUpdate }: ProfileBuilderFormProps) {
	const router = useRouter();
	const [isLoadingFields, setIsLoadingFields] = useState(true);
	const [groupedMetaFields, setGroupedMetaFields] = useState<GroupedModuleFields[]>([]);
	const [activeSubTab, setActiveSubTab] = useState<string>("");

	const { control, handleSubmit, reset, watch } = useForm<Record<string, any>>({
		mode: "onBlur",
		defaultValues: {},
	});

	const formValues = watch() as Record<string, any>;

	useEffect(() => {
		async function loadProfileFields() {
			try {
				// Load all module types with system='meta'
				const metaModuleTypesResult = await getMetaSystemModuleTypesAction();

				const allFields: FieldDefinition[] = [];
				const groupedFields: GroupedModuleFields[] = [];

				// Process all module types with system='meta'
				if (metaModuleTypesResult.success && metaModuleTypesResult.data) {
					const moduleTypes = metaModuleTypesResult.data as ModuleTypeDetail[];

					// Get all module types with system='meta' and sort them by order
					const sortedModuleTypes = moduleTypes.filter((mt) => mt.system === "meta").sort((a, b) => (a.order || 0) - (b.order || 0));

					// Process all module types in order
					for (const moduleType of sortedModuleTypes) {
						if (moduleType.fieldSchema && "fields" in moduleType.fieldSchema) {
							// Normalize field orders for fields
							let fieldsWithOrder = (moduleType.fieldSchema.fields as any[]).map((field, idx) => {
								if (!field.order || field.order <= 0) {
									return { ...field, order: idx + 1 };
								}
								return field;
							});

							const fields = fieldsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0));

							// Add to grouped fields
							groupedFields.push({
								moduleType,
								fields,
							});

							// Add to flat list for form handling
							allFields.push(...fields);
						}
					}

					setGroupedMetaFields(groupedFields);

					// Set first sub-tab as active
					if (groupedFields.length > 0 && groupedFields[0]?.moduleType?.id && !activeSubTab) {
						setActiveSubTab(groupedFields[0].moduleType.id);
					}
				} else {
					toast.error("Failed to load profile fields");
				}

				// Prepare default values
				const existingMetaData = typeof profile.metaData === "object" && profile.metaData ? profile.metaData : {};

				const defaultValues: Record<string, any> = {};
				allFields.forEach((field) => {
					const currentValue = existingMetaData[field.name];

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

				defaultValues["isPublic"] = profile.isPublic || false;
				reset(defaultValues, { keepValues: false });
			} catch (error) {
				console.error("Error loading profile fields:", error);
				toast.error("Failed to load profile fields");
			} finally {
				setIsLoadingFields(false);
			}
		}

		loadProfileFields();
	}, [profile, reset, activeSubTab]);

	const handleSave = async (data: Record<string, any>) => {
		try {
			const { isPublic, ...metaData } = data;

			const submitData = {
				isPublic: isPublic || false,
				metaData,
			};

			const result = await updateProfileAction(profile.id, submitData);

			if (result.success && result.data) {
				toast.success("Profile updated successfully!");
				onProfileUpdate?.(result.data as any);
				// Refresh to ensure consistency with database
				// But set a timeout to allow user to see success message first
				setTimeout(() => {
					router.refresh();
				}, 500);
			} else {
				toast.error(result.message || "Failed to update profile");
			}
		} catch (error) {
			toast.error("An error occurred");
			console.error(error);
		}
	};

	if (isLoadingFields) {
		return (
			<Card className="mt-10 p-6">
				<div className="flex items-center justify-center py-12">
					<Loader />
					<div className="text-muted-foreground ml-2">Loading profile fields...</div>
				</div>
			</Card>
		);
	}

	return (
		<form
			onSubmit={handleSubmit(handleSave)}
			className="space-y-6">
			<div className="mt-5 flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Manage Your Modules</h3>
					<p className="text-muted-foreground text-sm">Drag modules to reorder them across columns</p>
				</div>
				<Button type="submit">
					<Save className="mr-2 h-4 w-4" />
					Save Profile
				</Button>
			</div>
			<Card className="p-6">
				{/* Render sub-tabs for each ModuleType */}
				{groupedMetaFields.length > 0 ? (
					<Tabs
						value={activeSubTab}
						onValueChange={setActiveSubTab}
						className="w-full">
						<TabsList className="mb-6 grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{groupedMetaFields.map((group) => (
								<TabsTrigger
									key={group.moduleType.id}
									value={group.moduleType.id}
									className="text-xs sm:text-sm">
									{group.moduleType.name}
								</TabsTrigger>
							))}
						</TabsList>

						{groupedMetaFields.map((group) => (
							<TabsContent
								key={group.moduleType.id}
								value={group.moduleType.id}
								className="mt-0 space-y-6">
								<div className="space-y-4">
									{group.moduleType.description && <p className="text-muted-foreground text-sm">{group.moduleType.description}</p>}
									{group.fields.map((field) => (
										<ModuleFormField
											key={field.id}
											field={field}
											control={control}
											name={field.name as any}
										/>
									))}
								</div>
							</TabsContent>
						))}
					</Tabs>
				) : null}

				<div className="flex items-center space-x-2 border-t pt-4">
					<Checkbox
						id="isPublic"
						checked={formValues.isPublic || false}
						onCheckedChange={(checked) => {
							reset({ ...formValues, isPublic: checked });
						}}
					/>
					<Label
						htmlFor="isPublic"
						className="cursor-pointer font-normal">
						Make profile public (others can view your profile)
					</Label>
				</div>
			</Card>
		</form>
	);
}
