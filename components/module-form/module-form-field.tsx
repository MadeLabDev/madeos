"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { RichTextEditor } from "@/components/form-fields/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDefinition } from "@/lib/features/profile/types/user-profile.types";
import { cn } from "@/lib/utils";

import { FileUploadInput } from "./file-upload-input";
import { ImageUploadInput } from "./image-upload-input";
import { TagsInput } from "./tags-input";

interface ModuleFormFieldProps<T extends FieldValues> {
	field: FieldDefinition;
	control: Control<T>;
	name: Path<T>;
	error?: string;
}

export function ModuleFormField<T extends FieldValues>({ field, control, name, error }: ModuleFormFieldProps<T>) {
	// For boolean fields, don't render outer label since Switch has built-in label
	const isBooleanField = field.type === "boolean";

	// Determine default value based on field type
	const getDefaultValue = () => {
		if (field.type === "select" || field.type === "text" || field.type === "email" || field.type === "url" || field.type === "textarea" || field.type === "number") {
			return "";
		}
		if (field.type === "multiselect" || field.type === "checkbox" || field.type === "tags") {
			return [];
		}
		if (field.type === "file" || field.type === "image") {
			return null;
		}
		if (field.type === "boolean") {
			return false;
		}
		return undefined;
	};

	return (
		<Controller
			control={control}
			name={name}
			defaultValue={getDefaultValue() as any}
			render={({ field: fieldProps }) => (
				<div className="space-y-2">
					{!isBooleanField && (
						<Label htmlFor={field.id}>
							{field.label}
							{field.required && <span className="ml-1 text-red-500">*</span>}
						</Label>
					)}

					{field.type === "text" && (
						<Input
							id={field.id}
							placeholder={field.placeholder}
							{...fieldProps}
							value={fieldProps.value || ""}
							onChange={(e) => fieldProps.onChange(e.target.value)}
						/>
					)}

					{field.type === "email" && (
						<Input
							id={field.id}
							type="email"
							placeholder={field.placeholder}
							{...fieldProps}
							value={fieldProps.value || ""}
							onChange={(e) => fieldProps.onChange(e.target.value)}
						/>
					)}

					{field.type === "url" && (
						<Input
							id={field.id}
							type="url"
							placeholder={field.placeholder}
							{...fieldProps}
							value={fieldProps.value || ""}
							onChange={(e) => fieldProps.onChange(e.target.value)}
						/>
					)}

					{field.type === "number" && (
						<Input
							id={field.id}
							type="number"
							placeholder={field.placeholder}
							{...fieldProps}
							value={fieldProps.value || ""}
							onChange={(e) => fieldProps.onChange(e.target.value ? Number(e.target.value) : "")}
						/>
					)}

					{field.type === "textarea" && (
						<Textarea
							id={field.id}
							placeholder={field.placeholder}
							rows={field.rows || 3}
							{...fieldProps}
							value={fieldProps.value || ""}
							onChange={(e) => fieldProps.onChange(e.target.value)}
						/>
					)}

					{field.type === "richtext" && (
						<RichTextEditor
							value={fieldProps.value || ""}
							onChange={(jsonString) => fieldProps.onChange(jsonString)}
							minHeight="200px"
						/>
					)}

					{field.type === "select" && field.options && (
						<Select
							key={`select-${field.id}-${String(fieldProps.value || "")}`}
							value={String(fieldProps.value || "")}
							onValueChange={(value) => {
								fieldProps.onChange(value);
							}}>
							<SelectTrigger id={field.id}>
								<SelectValue placeholder={field.placeholder || "Select an option"} />
							</SelectTrigger>
							<SelectContent>
								{field.options.map((option) => (
									<SelectItem
										key={option.value}
										value={String(option.value)}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{field.type === "multiselect" && field.options && (
						<div className="space-y-2">
							{field.options.map((option) => (
								<div
									key={option.value}
									className="flex items-center space-x-2">
									<Checkbox
										id={`${field.id}-${option.value}`}
										checked={(Array.isArray(fieldProps.value) && fieldProps.value.map(String).includes(String(option.value))) || false}
										onCheckedChange={(checked) => {
											const current = Array.isArray(fieldProps.value) ? fieldProps.value : [];
											if (checked) {
												fieldProps.onChange([...current, option.value]);
											} else {
												fieldProps.onChange(current.filter((v: any) => String(v) !== String(option.value)));
											}
										}}
									/>
									<Label
										htmlFor={`${field.id}-${option.value}`}
										className="cursor-pointer font-normal">
										{option.label}
									</Label>
								</div>
							))}
						</div>
					)}

					{field.type === "checkbox" && field.options && (
						<div className="space-y-2">
							{field.options.map((option) => (
								<div
									key={option.value}
									className="flex items-center space-x-2">
									<Checkbox
										id={`${field.id}-${option.value}`}
										checked={(Array.isArray(fieldProps.value) && fieldProps.value.map(String).includes(String(option.value))) || false}
										onCheckedChange={(checked) => {
											const current = Array.isArray(fieldProps.value) ? fieldProps.value : [];
											if (checked) {
												fieldProps.onChange([...current, option.value]);
											} else {
												fieldProps.onChange(current.filter((v: any) => String(v) !== String(option.value)));
											}
										}}
									/>
									<Label
										htmlFor={`${field.id}-${option.value}`}
										className="cursor-pointer font-normal">
										{option.label}
									</Label>
								</div>
							))}
						</div>
					)}

					{field.type === "radio" && field.options && (
						<div className="space-y-2">
							{field.options.map((option) => (
								<div
									key={option.value}
									className="flex items-center space-x-2">
									<input
										type="radio"
										id={`${field.id}-${option.value}`}
										name={field.id}
										value={String(option.value)}
										checked={String(fieldProps.value || "") === String(option.value)}
										onChange={(e) => fieldProps.onChange(e.target.value)}
										className="h-4 w-4"
									/>
									<Label
										htmlFor={`${field.id}-${option.value}`}
										className="cursor-pointer font-normal">
										{option.label}
									</Label>
								</div>
							))}
						</div>
					)}

					{field.type === "boolean" && (
						<div className="flex items-center space-x-2">
							<Switch
								id={field.id}
								checked={fieldProps.value || false}
								onCheckedChange={fieldProps.onChange}
							/>
							<Label
								htmlFor={field.id}
								className="cursor-pointer font-normal">
								{field.label}
							</Label>
						</div>
					)}

					{field.type === "date" && (
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn("w-full pl-3 text-left font-normal", !fieldProps.value && "text-muted-foreground")}>
									{fieldProps.value ? format(new Date(fieldProps.value), "PPP") : <span>Pick a date</span>}
									<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0"
								align="start">
								<Calendar
									mode="single"
									selected={fieldProps.value ? new Date(fieldProps.value) : undefined}
									onSelect={(date) => fieldProps.onChange(date?.toISOString().split("T")[0] || "")}
									disabled={(date) => date < new Date("1900-01-01")}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
					)}

					{field.type === "daterange" && (
						<div className="space-y-2">
							<p className="text-sm text-gray-600">Start and end dates</p>
							<div className="grid grid-cols-2 gap-2">
								<div>
									<label className="text-xs text-gray-600">Start</label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant={"outline"}
												className={cn("w-full pl-3 text-left font-normal", !fieldProps.value?.start && "text-muted-foreground")}>
												{fieldProps.value?.start ? format(new Date(fieldProps.value.start), "PPP") : <span>Pick a date</span>}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start">
											<Calendar
												mode="single"
												selected={fieldProps.value?.start ? new Date(fieldProps.value.start) : undefined}
												onSelect={(date) => {
													const current = fieldProps.value || {};
													fieldProps.onChange({
														...current,
														start: date?.toISOString().split("T")[0] || "",
													});
												}}
												disabled={(date) => date < new Date("1900-01-01")}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div>
									<label className="text-xs text-gray-600">End</label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant={"outline"}
												className={cn("w-full pl-3 text-left font-normal", !fieldProps.value?.end && "text-muted-foreground")}>
												{fieldProps.value?.end ? format(new Date(fieldProps.value.end), "PPP") : <span>Pick a date</span>}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start">
											<Calendar
												mode="single"
												selected={fieldProps.value?.end ? new Date(fieldProps.value.end) : undefined}
												onSelect={(date) => {
													const current = fieldProps.value || {};
													fieldProps.onChange({
														...current,
														end: date?.toISOString().split("T")[0] || "",
													});
												}}
												disabled={(date) => date < new Date("1900-01-01")}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>
					)}

					{field.type === "tags" && (
						<TagsInput
							value={Array.isArray(fieldProps.value) ? fieldProps.value : []}
							onChange={fieldProps.onChange}
							placeholder={field.placeholder}
						/>
					)}

					{field.type === "file" && (
						<FileUploadInput
							value={fieldProps.value}
							onChange={fieldProps.onChange}
							acceptedFileTypes={field.acceptedFileTypes}
							maxFileSize={field.maxFileSize}
							placeholder={field.placeholder}
						/>
					)}

					{field.type === "image" && (
						<ImageUploadInput
							value={fieldProps.value}
							onChange={fieldProps.onChange}
							maxFileSize={field.maxFileSize}
							placeholder={field.placeholder}
						/>
					)}

					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>
			)}
		/>
	);
}
