"use client";

/**
 * FieldSchemaBuilder Component
 * Visual builder for field schema with support for all field types
 * Inspired by @@@SampleSource/FieldSchemaBuilder
 */

import { useState } from "react";

import { ChevronDown, ChevronUp, Lock, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FieldEditDialogProps, FieldItemProps, FieldSchemaBuilderProps, FieldSchemaItem, FieldType } from "@/lib/features/meta/types";

// Complete field types
const FIELD_TYPES = [
	{ value: "text", label: "Text (Single line)" },
	{ value: "textarea", label: "Textarea (Multi-line)" },
	{ value: "richtext", label: "Rich Text Editor" },
	{ value: "number", label: "Number" },
	{ value: "boolean", label: "Boolean (Switch)" },
	{ value: "select", label: "Select (Dropdown)" },
	{ value: "multiselect", label: "Multi-select" },
	{ value: "radio", label: "Radio (Single choice)" },
	{ value: "tags", label: "Tags Input" },
	{ value: "date", label: "Date Picker" },
	{ value: "daterange", label: "Date Range" },
	{ value: "email", label: "Email" },
	{ value: "url", label: "URL" },
	{ value: "file", label: "File Upload" },
	{ value: "image", label: "Image Upload" },
];

export function FieldSchemaBuilder({ fields, onChange, lockedFieldIds = [] }: FieldSchemaBuilderProps) {
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [showDialog, setShowDialog] = useState(false);

	const handleAddField = () => {
		setEditingIndex(undefined as any);
		setShowDialog(true);
	};

	const handleEditField = (index: number) => {
		setEditingIndex(index);
		setShowDialog(true);
	};

	const handleDeleteField = (index: number) => {
		const fieldId = fields[index]?.id;

		// Check if field is locked
		if (fieldId && lockedFieldIds.includes(fieldId)) {
			alert("This field is locked and cannot be deleted. It is a system default field.");
			return;
		}

		// Confirm before delete
		if (!window.confirm("Are you sure you want to delete this field? This action cannot be undone.")) {
			return;
		}
		const newFields = fields.filter((_, i) => i !== index);
		onChange(newFields);
	};

	const handleMoveField = (index: number, direction: "up" | "down") => {
		let newFields = [...fields];
		const targetIndex = direction === "up" ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= newFields.length) return;

		const temp = newFields[index]!;
		newFields[index] = newFields[targetIndex]!;
		newFields[targetIndex] = temp;

		// Update order values to match new positions
		newFields = newFields.map((field, idx) => ({
			...field,
			order: idx + 1,
		}));

		onChange(newFields);
	};

	const handleSaveField = (field: FieldSchemaItem) => {
		let newFields = [...fields];

		if (editingIndex !== null && editingIndex !== undefined && editingIndex >= 0) {
			// Editing existing field - keep as is
			console.log("[FieldSchemaBuilder] Editing field:", field.name, "Order:", field.order);
			newFields[editingIndex] = field;
		} else {
			// Adding new field - calculate proper order
			// Find max order from all existing fields
			const maxOrder = newFields.length > 0 ? Math.max(...newFields.map((f) => f.order || 0)) : 0;
			console.log("[FieldSchemaBuilder] Adding new field:", field.name, "MaxOrder:", maxOrder, "Assigning order:", maxOrder + 1);
			field.order = maxOrder + 1;
			newFields.push(field);
		}

		console.log(
			"[FieldSchemaBuilder] After save, all fields:",
			newFields.map((f) => `${f.name}(${f.order})`),
		);
		onChange(newFields);
		setShowDialog(false);
		setEditingIndex(null);
	};

	return (
		<div className="space-y-4">
			{fields.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground mb-4 text-sm">No fields defined yet. Add your first field to get started.</p>
						<Button
							type="button"
							onClick={handleAddField}>
							<Plus className="mr-2 h-4 w-4" />
							Add First Field
						</Button>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="space-y-2">
						{fields.map((field, index) => (
							<FieldItem
								key={field.id}
								field={field}
								index={index}
								isFirst={index === 0}
								isLast={index === fields.length - 1}
								onEdit={() => handleEditField(index)}
								onMoveUp={() => handleMoveField(index, "up")}
								onMoveDown={() => handleMoveField(index, "down")}
								onDelete={() => handleDeleteField(index)}
								isLocked={lockedFieldIds.includes(field.id)}
							/>
						))}
					</div>

					<Button
						type="button"
						variant="outline"
						onClick={handleAddField}
						className="w-full">
						<Plus className="mr-2 h-4 w-4" />
						Add Another Field
					</Button>
				</>
			)}

			{showDialog && (
				<FieldEditDialog
					field={editingIndex !== null && editingIndex >= 0 ? fields[editingIndex] : undefined}
					isLocked={editingIndex !== null && editingIndex >= 0 ? lockedFieldIds.includes(fields[editingIndex]?.id || "") : false}
					onClose={() => {
						setShowDialog(false);
						setEditingIndex(null);
					}}
					onSave={handleSaveField}
				/>
			)}
		</div>
	);
}

// ============================================
// FIELD ITEM COMPONENT
// ============================================

function FieldItem({ field, isFirst, isLast, onEdit, onMoveUp, onMoveDown, onDelete, isLocked = false }: FieldItemProps) {
	const fieldType = FIELD_TYPES.find((t) => t.value === field.type);
	const needsOptions = ["select", "multiselect", "radio", "tags"].includes(field.type);

	return (
		<Card className="p-0">
			<CardContent className="flex items-center gap-4 p-4">
				{/* Reorder Controls */}
				<div className="flex flex-col gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={onMoveUp}
						disabled={isFirst}
						title="Move up">
						<ChevronUp className="h-4 w-4" />
					</Button>
					{/* <GripVertical className="h-4 w-4 mx-auto text-muted-foreground" /> */}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={onMoveDown}
						disabled={isLast}
						title="Move down">
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>

				{/* Field Info */}
				<div className="flex-1 space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="font-medium">{field.label}</span>
						{isLocked && (
							<Badge
								variant="secondary"
								className="flex items-center gap-1 text-xs">
								<Lock className="h-3 w-3" />
								Locked
							</Badge>
						)}
						{field.required && (
							<Badge
								variant="destructive"
								className="text-xs">
								Required
							</Badge>
						)}
						<Badge
							variant="outline"
							className="text-xs">
							{fieldType?.label || field.type}
						</Badge>
						{needsOptions && field.options && field.options.length > 0 && (
							<Badge
								variant="secondary"
								className="text-xs">
								{field.options.length} options
							</Badge>
						)}
					</div>
					<div className="text-muted-foreground text-sm">
						<code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{field.name}</code>
						{field.description && <span className="mt-1 ml-2 block">{field.description}</span>}
					</div>
				</div>

				{/* Actions */}
				<div className="flex flex-shrink-0 gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onEdit}>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onDelete}
						disabled={isLocked}
						className={isLocked ? "cursor-not-allowed opacity-50" : "text-destructive hover:text-destructive"}
						title={isLocked ? "This is a locked system field and cannot be deleted" : "Delete field"}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// ============================================
// FIELD EDIT DIALOG
// ============================================

function FieldEditDialog({ field, isLocked = false, onClose, onSave }: FieldEditDialogProps) {
	const isEdit = !!field;
	const [formData, setFormData] = useState<Partial<FieldSchemaItem>>(
		() =>
			field || {
				id: `field_${crypto.randomUUID()}`,
				name: "",
				type: "text",
				label: "",
				required: false,
				order: 0,
			},
	);

	const [optionsText, setOptionsText] = useState(field?.options?.map((opt) => `${opt.value}:${opt.label}`).join("\n") || "");

	const needsOptions = ["select", "multiselect", "radio", "tags"].includes(formData.type || "text");

	const handleSubmit = (e: React.FormEvent) => {
		// Prevent both default and parent form submission
		e.preventDefault();
		e.stopPropagation();

		if (!formData.name || !formData.type || !formData.label) {
			alert("Please fill in name, type, and label");
			return;
		}

		// Validate field name format
		if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
			alert("Field name must start with letter/underscore, contain only letters, numbers, underscores");
			return;
		}

		// Parse options if needed
		let options: Array<{ label: string; value: string }> | undefined;
		if (needsOptions && optionsText.trim()) {
			options = optionsText
				.split("\n")
				.filter((line) => line.trim())
				.map((line) => {
					const [value, label] = line.split(":").map((s) => s.trim());
					return { value: value || "", label: label || value || "" };
				});

			if (!options.length) {
				alert("Please add at least one option");
				return;
			}
		} else if (needsOptions && !optionsText.trim()) {
			alert("Please add options for this field type");
			return;
		}

		onSave({
			id: formData.id!,
			name: formData.name,
			type: formData.type as FieldType,
			label: formData.label,
			required: formData.required || false,
			placeholder: formData.placeholder,
			description: formData.description,
			order: formData.order !== undefined ? formData.order : 0, // Will be recalculated in handleSaveField if new
			options,
			validation: formData.validation,
			defaultValue: formData.defaultValue,
		});
	};

	return (
		<Dialog
			open={true}
			onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{isEdit ? "Edit Field" : "Add New Field"}</DialogTitle>
						<DialogDescription>Configure field settings, validation, and options</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Locked field warning */}
						{isLocked && (
							<div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
								<div className="mb-2 flex items-center gap-2">
									<Lock className="h-4 w-4" />
									<strong>Locked Field</strong>
								</div>
								<p>This is a system default field. You cannot change its Field Name (property), but you can edit other settings like Display Label and validation rules.</p>
							</div>
						)}

						{/* Basic Info Grid */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="field-name">
									Field Name <span className="text-destructive">*</span>
								</Label>
								<Input
									id="field-name"
									value={formData.name || ""}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									placeholder="jobTitle"
									required
									pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
									title="Must start with letter/underscore, contain only letters, numbers, underscores"
									disabled={isLocked}
									className={isLocked ? "cursor-not-allowed opacity-60" : ""}
								/>
								<p className="text-muted-foreground text-xs">{isLocked ? "System default field - cannot be changed" : "Database field identifier (e.g., jobTitle, startDate)"}</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="field-type">
									Field Type <span className="text-destructive">*</span>
								</Label>
								<Select
									value={formData.type || "text"}
									onValueChange={(value) => setFormData({ ...formData, type: value as FieldType })}
									disabled={isLocked}>
									<SelectTrigger
										id="field-type"
										className={isLocked ? "cursor-not-allowed opacity-60" : ""}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{FIELD_TYPES.map((type) => (
											<SelectItem
												key={type.value}
												value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{isLocked && <p className="text-muted-foreground text-xs">System default field - cannot be changed</p>}
							</div>
						</div>

						{/* Display Label */}
						<div className="space-y-2">
							<Label htmlFor="field-label">
								Display Label <span className="text-destructive">*</span>
							</Label>
							<Input
								id="field-label"
								value={formData.label || ""}
								onChange={(e) => setFormData({ ...formData, label: e.target.value })}
								placeholder="Job Title"
								required
							/>
							<p className="text-muted-foreground text-xs">Label shown to users in forms</p>
						</div>

						{/* Placeholder & Description */}
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="field-placeholder">Placeholder</Label>
								<Input
									id="field-placeholder"
									value={formData.placeholder || ""}
									onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
									placeholder="e.g., Senior Developer"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="field-description">Description</Label>
								<Input
									id="field-description"
									value={formData.description || ""}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									placeholder="Help text for users..."
								/>
							</div>
						</div>

						{/* Options for Select/Multiselect/Tags */}
						{needsOptions && (
							<div className="space-y-2">
								<Label htmlFor="field-options">
									Options <span className="text-destructive">*</span>
								</Label>
								<Textarea
									id="field-options"
									value={optionsText}
									onChange={(e) => setOptionsText(e.target.value)}
									placeholder={"value1:Label 1\nvalue2:Label 2\nvalue3:Label 3"}
									rows={6}
									required={needsOptions}
								/>
								<p className="text-muted-foreground text-xs">
									One option per line in format: <code className="bg-muted rounded px-1.5 py-0.5">value:Label</code>
									<br />
									Example: <code className="bg-muted rounded px-1.5 py-0.5">frontend:Frontend Developer</code>
								</p>
							</div>
						)}

						{/* Validation - Text/Textarea */}
						{["text", "textarea"].includes(formData.type || "") && (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="field-minLength">Min Length</Label>
									<Input
										id="field-minLength"
										type="number"
										value={formData.validation?.minLength || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												validation: {
													...formData.validation,
													minLength: parseInt(e.target.value) || undefined,
												},
											})
										}
										min="0"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="field-maxLength">Max Length</Label>
									<Input
										id="field-maxLength"
										type="number"
										value={formData.validation?.maxLength || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												validation: {
													...formData.validation,
													maxLength: parseInt(e.target.value) || undefined,
												},
											})
										}
										min="0"
									/>
								</div>
							</div>
						)}

						{/* Validation - Number */}
						{formData.type === "number" && (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="field-min">Min Value</Label>
									<Input
										id="field-min"
										type="number"
										value={formData.validation?.min || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												validation: {
													...formData.validation,
													min: parseFloat(e.target.value) || undefined,
												},
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="field-max">Max Value</Label>
									<Input
										id="field-max"
										type="number"
										value={formData.validation?.max || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												validation: {
													...formData.validation,
													max: parseFloat(e.target.value) || undefined,
												},
											})
										}
									/>
								</div>
							</div>
						)}

						{/* Required Toggle */}
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<Label htmlFor="field-required">Required Field</Label>
								<p className="text-muted-foreground text-sm">Users must fill this field</p>
							</div>
							<Switch
								id="field-required"
								checked={formData.required || false}
								onCheckedChange={(checked: boolean) => setFormData({ ...formData, required: checked })}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">{isEdit ? "Update Field" : "Add Field"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
