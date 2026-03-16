"use client";

import { useState } from "react";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/form-fields/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldSchemaItem } from "@/lib/features/meta";
import type { ModuleInstanceFormProps } from "@/lib/features/meta/types";
import { cn } from "@/lib/utils";

export function ModuleInstanceForm({ moduleType, moduleTypes, selectedModuleTypeId, defaultValues, onSubmit, onCancel, onModuleTypeChange, hideButtons }: ModuleInstanceFormProps) {
	const [entityId, setEntityId] = useState(defaultValues?.entityId || "");
	const [entityName, setEntityName] = useState(defaultValues?.entityName || "");
	const [fieldValues, setFieldValues] = useState<Record<string, any>>(defaultValues?.fieldValues || {});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Handle field value changes
	const handleFieldChange = (fieldName: string, value: any) => {
		setFieldValues((prev) => ({
			...prev,
			[fieldName]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!entityId.trim()) {
			toast.error("Entity ID is required");
			return;
		}
		if (!entityName.trim()) {
			toast.error("Entity Name is required");
			return;
		}

		// Check all required fields
		const schema = moduleType?.fieldSchema?.fields || [];
		for (const field of schema) {
			if (field.required && !fieldValues[field.name]) {
				toast.error(`${field.label} is required`);
				return;
			}
		}

		setIsSubmitting(true);
		try {
			await onSubmit(fieldValues, entityId, entityName);
		} finally {
			setIsSubmitting(false);
		}
	};

	const schema = moduleType?.fieldSchema?.fields || [];

	return (
		<form
			onSubmit={handleSubmit}
			data-module-instance-form
			className="space-y-6">
			{/* Module Type Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Module Type</CardTitle>
					<CardDescription>Select which module type to create an instance for</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Label htmlFor="module-type">Module Type</Label>
						<Select
							value={selectedModuleTypeId}
							onValueChange={onModuleTypeChange}>
							<SelectTrigger id="module-type">
								<SelectValue placeholder="Select a module type" />
							</SelectTrigger>
							<SelectContent>
								{moduleTypes.map((mt) => (
									<SelectItem
										key={mt.id}
										value={mt.id}>
										{mt.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Entity Information */}
			<Card>
				<CardHeader>
					<CardTitle>Entity Information</CardTitle>
					<CardDescription>Identify the entity this instance belongs to</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="entity-id">Entity ID *</Label>
						<Input
							id="entity-id"
							placeholder="e.g., PROD-001"
							value={entityId}
							onChange={(e) => setEntityId(e.target.value)}
							disabled={isSubmitting}
						/>
						<p className="text-muted-foreground text-sm">Unique identifier for the entity</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="entity-name">Entity Name *</Label>
						<Input
							id="entity-name"
							placeholder="e.g., Blue T-Shirt"
							value={entityName}
							onChange={(e) => setEntityName(e.target.value)}
							disabled={isSubmitting}
						/>
						<p className="text-muted-foreground text-sm">Display name for the entity</p>
					</div>
				</CardContent>
			</Card>

			{/* Field Values */}
			{schema.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Field Values</CardTitle>
						<CardDescription>Fill in the values for {moduleType?.name}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{schema.map((field) => (
							<div
								key={field.id}
								className="space-y-2">
								<Label htmlFor={field.name}>
									{field.label} {field.required && <span className="text-destructive">*</span>}
								</Label>
								{renderFieldInput(field, fieldValues[field.name], (value) => handleFieldChange(field.name, value), isSubmitting)}
								{field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
								{field.placeholder && <p className="text-muted-foreground text-xs italic">Placeholder: {field.placeholder}</p>}
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Action Buttons */}
			{!hideButtons && (
				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Instance"}
					</Button>
				</div>
			)}

			{hideButtons && (
				<button
					type="submit"
					hidden
				/>
			)}
		</form>
	);
}

// ============================================
// FIELD RENDERER - Support all field types
// ============================================

function renderFieldInput(field: FieldSchemaItem, value: any, onChange: (value: any) => void, disabled: boolean) {
	const commonProps = {
		id: field.name,
		disabled,
	};

	switch (field.type) {
		// Text Inputs
		case "text":
			return (
				<Input
					{...commonProps}
					type="text"
					placeholder={field.placeholder}
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);

		case "email":
			return (
				<Input
					{...commonProps}
					type="email"
					placeholder={field.placeholder || "example@email.com"}
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);

		case "url":
			return (
				<Input
					{...commonProps}
					type="url"
					placeholder={field.placeholder || "https://example.com"}
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);

		case "number":
			return (
				<Input
					{...commonProps}
					type="number"
					placeholder={field.placeholder}
					value={value !== undefined && value !== null && value !== "" ? value : ""}
					onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
					min={field.validation?.min}
					max={field.validation?.max}
				/>
			);

		// Text Areas
		case "textarea":
			return (
				<Textarea
					{...commonProps}
					placeholder={field.placeholder}
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					rows={4}
				/>
			);

		case "richtext":
			return (
				<div className="space-y-1">
					<RichTextEditor
						value={value || ""}
						onChange={onChange}
						minHeight="300px"
					/>
				</div>
			);

		// Date Inputs
		case "date":
			return (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={cn("w-full pl-3 text-left font-normal", !value && "text-muted-foreground")}>
							{value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
							<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-auto p-0"
						align="start">
						<Calendar
							mode="single"
							selected={value ? new Date(value) : undefined}
							onSelect={(date) => onChange(date?.toISOString().split("T")[0] || "")}
							disabled={(date) => date < new Date("1900-01-01")}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			);

		case "daterange":
			return (
				<div className="flex gap-2">
					<div className="flex-1">
						<Label
							htmlFor={`${field.name}-start`}
							className="text-xs">
							Start Date
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn("w-full pl-3 text-left font-normal", !value?.start && "text-muted-foreground")}>
									{value?.start ? format(new Date(value.start), "PPP") : <span>Pick a date</span>}
									<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start">
								<Calendar
									mode="single"
									selected={value?.start ? new Date(value.start) : undefined}
									onSelect={(date) => onChange({ ...value, start: date?.toISOString().split("T")[0] || "" })}
									disabled={(date) => date < new Date("1900-01-01")}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
					<div className="flex-1">
						<Label
							htmlFor={`${field.name}-end`}
							className="text-xs">
							End Date
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn("w-full pl-3 text-left font-normal", !value?.end && "text-muted-foreground")}>
									{value?.end ? format(new Date(value.end), "PPP") : <span>Pick a date</span>}
									<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start">
								<Calendar
									mode="single"
									selected={value?.end ? new Date(value.end) : undefined}
									onSelect={(date) => onChange({ ...value, end: date?.toISOString().split("T")[0] || "" })}
									disabled={(date) => date < new Date("1900-01-01")}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			);

		// Boolean/Checkbox
		case "boolean":
			return (
				<div className="flex items-center gap-2">
					<Checkbox
						{...commonProps}
						checked={value || false}
						onCheckedChange={onChange}
					/>
					<label
						htmlFor={field.name}
						className="cursor-pointer text-sm">
						{field.placeholder || "Enable this option"}
					</label>
				</div>
			);

		// Select/Dropdown
		case "select":
			return (
				<Select
					value={value || ""}
					onValueChange={onChange}
					disabled={disabled}>
					<SelectTrigger {...commonProps}>
						<SelectValue placeholder={field.placeholder || "Select an option"} />
					</SelectTrigger>
					<SelectContent>
						{(field.options || []).length === 0 ? (
							<SelectItem
								value="__no-options"
								disabled>
								No options available
							</SelectItem>
						) : (
							(field.options || []).map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}>
									{option.label}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			);

		// Multi-select (using checkboxes)
		case "multiselect":
			return (
				<div className="space-y-2 rounded-lg border p-3">
					{(field.options || []).length === 0 ? (
						<p className="text-muted-foreground text-sm">No options available</p>
					) : (
						(field.options || []).map((option) => (
							<div
								key={option.value}
								className="flex items-center gap-2">
								<Checkbox
									id={`${field.name}-${option.value}`}
									checked={(value || []).includes(option.value)}
									onCheckedChange={(checked) => {
										const newValue = checked ? [...(value || []), option.value] : (value || []).filter((v: string) => v !== option.value);
										onChange(newValue);
									}}
									disabled={disabled}
								/>
								<label
									htmlFor={`${field.name}-${option.value}`}
									className="flex-1 cursor-pointer text-sm">
									{option.label}
								</label>
							</div>
						))
					)}
				</div>
			);

		// Radio Buttons (single select)
		case "radio":
			return (
				<div className="space-y-2">
					{(field.options || []).length === 0 ? (
						<p className="text-muted-foreground text-sm">No options available</p>
					) : (
						(field.options || []).map((option) => (
							<div
								key={option.value}
								className="flex items-center gap-2">
								<input
									type="radio"
									id={`${field.name}-${option.value}`}
									name={field.name}
									value={option.value}
									checked={value === option.value}
									onChange={() => onChange(option.value)}
									disabled={disabled}
									className="h-4 w-4"
								/>
								<label
									htmlFor={`${field.name}-${option.value}`}
									className="flex-1 cursor-pointer text-sm">
									{option.label}
								</label>
							</div>
						))
					)}
				</div>
			);

		// Tags Input (comma-separated or space-separated)
		case "tags":
			return (
				<div className="space-y-2">
					<Input
						{...commonProps}
						placeholder={field.placeholder || "Enter tags separated by commas"}
						value={Array.isArray(value) ? value.join(", ") : value || ""}
						onChange={(e) => {
							const tags = e.target.value
								.split(",")
								.map((tag: string) => tag.trim())
								.filter((tag: string) => tag.length > 0);
							onChange(tags);
						}}
					/>
					<div className="flex flex-wrap gap-1">
						{Array.isArray(value) &&
							value.length > 0 &&
							value.map((tag: string) => (
								<div
									key={tag}
									className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded px-2 py-1 text-xs">
									{tag}
									<button
										type="button"
										onClick={() => onChange(value.filter((t: string) => t !== tag))}
										className="hover:text-destructive"
										disabled={disabled}>
										×
									</button>
								</div>
							))}
					</div>
					<p className="text-muted-foreground text-xs">Separate tags with commas</p>
				</div>
			);

		// File Upload
		case "file":
			return (
				<div className="space-y-2">
					<Input
						{...commonProps}
						type="file"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								onChange({
									name: file.name,
									size: file.size,
									type: file.type,
									lastModified: file.lastModified,
								});
							}
						}}
					/>
					{value && (
						<div className="text-muted-foreground text-sm">
							<p>📄 {value.name}</p>
							<p className="text-xs">Size: {(value.size / 1024).toFixed(2)} KB</p>
						</div>
					)}
				</div>
			);

		// Image Upload
		case "image":
			return (
				<div className="space-y-2">
					<Input
						{...commonProps}
						type="file"
						accept="image/*"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								// In production, would upload to server/cloud storage
								const reader = new FileReader();
								reader.onload = (event) => {
									onChange({
										name: file.name,
										size: file.size,
										type: file.type,
										preview: event.target?.result,
									});
								};
								reader.readAsDataURL(file);
							}
						}}
					/>
					{value?.preview && (
						<div className="mt-2">
							<div className="relative h-48 w-full max-w-sm">
								<Image
									src={value.preview}
									alt="Preview"
									fill
									className="rounded border object-cover"
								/>
							</div>
							<p className="text-muted-foreground mt-1 text-xs">
								📸 {value.name} ({(value.size / 1024).toFixed(2)} KB)
							</p>
						</div>
					)}
				</div>
			);

		default:
			return (
				<Input
					{...commonProps}
					type="text"
					placeholder={field.placeholder}
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
				/>
			);
	}
}
