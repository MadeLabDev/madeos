"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import type { FieldDefinition } from "@/lib/features/profile/types/user-profile.types";

import { ModuleFormField } from "./module-form-field";

interface DynamicModuleFormProps {
	moduleTypeName: string;
	moduleTypeDescription?: string;
	fields: FieldDefinition[];
	onSubmit: (data: Record<string, any>) => Promise<void>;
	isLoading?: boolean;
	onCancel?: () => void;
}

export function DynamicModuleForm({ moduleTypeName, moduleTypeDescription, fields, onSubmit, isLoading = false, onCancel }: DynamicModuleFormProps) {
	const [error, setError] = useState<string | null>(null);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: "onBlur",
		defaultValues: fields.reduce(
			(acc, field) => {
				acc[field.name] = "";
				return acc;
			},
			{} as Record<string, any>,
		),
	});

	const handleSubmitForm = async (data: Record<string, any>) => {
		try {
			setError(null);
			await onSubmit(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save module");
		}
	};

	// Sort fields by order
	const sortedFields = [...fields].sort((a, b) => a.order - b.order);

	return (
		<div className="mx-auto max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle>{moduleTypeName}</CardTitle>
					{moduleTypeDescription && <CardDescription>{moduleTypeDescription}</CardDescription>}
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(handleSubmitForm)}
						className="space-y-6">
						{/* Error message */}
						{error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

						{/* Form fields */}
						<div className="space-y-4">
							{sortedFields.map((field) => (
								<ModuleFormField
									key={field.id}
									field={field}
									control={control}
									name={field.name as any}
									error={errors[field.name]?.message as string | undefined}
								/>
							))}
						</div>

						{/* Form actions */}
						<div className="flex justify-end gap-3 border-t pt-4">
							{onCancel && (
								<Button
									variant="outline"
									type="button"
									onClick={onCancel}
									disabled={isLoading}>
									Cancel
								</Button>
							)}
							<Button
								type="submit"
								disabled={isLoading}>
								{isLoading && (
									<Loader
										size="sm"
										className="mr-2"
									/>
								)}
								{isLoading ? "Saving..." : "Save Module"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
