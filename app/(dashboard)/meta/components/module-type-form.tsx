"use client";

import { useCallback, useState } from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SYSTEM_TYPES } from "@/lib/config/module-types";
import { isProtectedModuleType } from "@/lib/features/meta/config/protected-types";
import type { FieldSchemaItem, ModuleTypeFormProps } from "@/lib/features/meta/types";

import { FieldSchemaBuilder } from "./field-schema-builder";

export function ModuleTypeForm({ defaultValues, onSubmit, isLoading = false, onCancel, hideButtons = false }: ModuleTypeFormProps) {
	const [loading, setLoading] = useState(isLoading);
	const isProtected = defaultValues?.key ? isProtectedModuleType(defaultValues.key) : false;

	const [formData, setFormData] = useState({
		key: defaultValues?.key || "",
		name: defaultValues?.name || "",
		description: defaultValues?.description || "",
		system: defaultValues?.system || "meta",
		fieldSchema: defaultValues?.fieldSchema?.fields || [],
		isEnabled: defaultValues?.isEnabled !== false,
		order: defaultValues?.order || 0,
	});

	// Parse lockedFields from either array or JSON string
	const lockedFieldIds = Array.isArray(defaultValues?.lockedFields) ? defaultValues.lockedFields : typeof defaultValues?.lockedFields === "string" ? JSON.parse(defaultValues.lockedFields) : [];

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	}, []);

	const handleSystemChange = useCallback((value: string) => {
		setFormData((prev) => ({
			...prev,
			system: value,
		}));
	}, []);

	const handleFieldsChange = useCallback((fields: FieldSchemaItem[]) => {
		setFormData((prev) => ({
			...prev,
			fieldSchema: fields,
		}));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name || !formData.key) {
			toast.error("Please fill in name and key");
			return;
		}

		// Validate key format
		if (!/^[a-z_][a-z0-9_]*$/.test(formData.key)) {
			toast.error("Key must start with lowercase letter or underscore, contain only lowercase letters, numbers, and underscores");
			return;
		}

		if (formData.fieldSchema.length === 0) {
			toast.error("Please add at least one field");
			return;
		}

		setLoading(true);

		try {
			const submitData = {
				...formData,
				fieldSchema: {
					fields: formData.fieldSchema,
				},
			};
			await onSubmit(submitData);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
			data-module-type-form>
			{/* Two Column Layout */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Left Column - Basic Info */}
				<div className="space-y-6">
					{/* Basic Info Card */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>Define the module type name and description</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{isProtected && (
								<div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100">
									<strong>System Type:</strong> This is a protected system module type. Key and Display Name cannot be edited.
								</div>
							)}

							{/* Module Type Key */}
							<div className={isProtected ? "hidden" : ""}>
								<Label
									htmlFor="key"
									className="text-sm font-medium">
									Module Type Key (identifier) *
								</Label>
								<Input
									id="key"
									name="key"
									value={formData.key}
									onChange={handleChange}
									placeholder="e.g., product_details"
									required
									pattern="^[a-z_][a-z0-9_]*$"
									title="Must start with lowercase letter or underscore, contain only lowercase letters, numbers, underscores"
									className="mt-2 font-mono text-sm"
									disabled={isProtected}
								/>
								<p className="text-muted-foreground mt-1 text-xs">Used as unique identifier (lowercase, numbers, underscores only)</p>
							</div>

							{/* Name */}
							<div className={isProtected ? "hidden" : ""}>
								<Label
									htmlFor="name"
									className="text-sm font-medium">
									Display Name *
								</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="e.g., Product Details"
									required
									className="mt-2"
									disabled={isProtected}
								/>
							</div>

							{/* System Type */}
							<div className={isProtected ? "hidden" : ""}>
								<Label
									htmlFor="system"
									className="text-sm font-medium">
									System Type *
								</Label>
								<Select
									key={`system-${formData.system}`}
									value={formData.system || "meta"}
									onValueChange={handleSystemChange}
									disabled={isProtected}>
									<SelectTrigger
										id="system"
										className="mt-2">
										<SelectValue placeholder="Select a system type" />
									</SelectTrigger>
									<SelectContent>
										{SYSTEM_TYPES.map((type) => (
											<SelectItem
												key={type.value}
												value={type.value}>
												{type.label}
											</SelectItem>
										))}
										{/* Fallback option if current value is not in the list */}
										{formData.system && !SYSTEM_TYPES.some((type) => type.value === formData.system) && <SelectItem value={formData.system}>{formData.system} (Current)</SelectItem>}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground mt-1 text-xs">Assign this module type to a system (blog, knowledge, product, order, or meta)</p>
							</div>

							{/* Description */}
							<div>
								<Label
									htmlFor="description"
									className="text-sm font-medium">
									Description
								</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Describe what this module type is used for"
									rows={3}
									className="mt-2"
								/>
							</div>

							{/* Order */}
							<div>
								<Label
									htmlFor="order"
									className="text-sm font-medium">
									Order
								</Label>
								<Input
									id="order"
									name="order"
									type="number"
									value={formData.order}
									onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
									placeholder="0"
									className="mt-2"
								/>
								<p className="text-muted-foreground mt-1 text-xs">Display order (lower numbers appear first)</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Field Schema */}
				<div className="space-y-6">
					{/* Fields Schema Card */}
					<div>
						<h3 className="mb-2 text-xl font-bold">Field Schema</h3>
						<p className="text-muted-foreground mb-4">Define the fields for this module type</p>
						<FieldSchemaBuilder
							fields={formData.fieldSchema}
							onChange={handleFieldsChange}
							lockedFieldIds={lockedFieldIds}
						/>
					</div>
				</div>
			</div>

			{/* Buttons */}
			{!hideButtons && (
				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={loading}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={loading}>
						{loading && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						Save Module Type
					</Button>
				</div>
			)}

			{/* Hidden submit button for header trigger */}
			<button
				type="submit"
				className="hidden"
			/>
		</form>
	);
}
