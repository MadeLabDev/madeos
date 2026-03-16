"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SOPStatus } from "@/generated/prisma/enums";
import { createSOPAction, getSOPAction, updateSOPAction } from "@/lib/features/sop-library/actions/sop-library.actions";
import type { CreateSOPInput, UpdateSOPInput } from "@/lib/features/sop-library/types/sop-library.types";
import { generateSlug } from "@/lib/utils/slug-generator";

const SOPStatusOptions = {
	DRAFT: "DRAFT",
	PUBLISHED: "PUBLISHED",
	ARCHIVED: "ARCHIVED",
} as const;

const sopLibrarySchema = z.object({
	title: z.string().min(1, "Title is required"),
	slug: z.string().min(1, "Slug is required"),
	description: z.string().optional(),
	category: z.string().optional(),
	content: z.string().min(1, "Content is required"),
	version: z.number().min(1).optional(),
	status: z.nativeEnum(SOPStatus).optional(),
	effectiveDate: z.string().optional(),
});

type SOPLibraryFormData = z.infer<typeof sopLibrarySchema>;

interface SOPLibraryFormProps {
	sopId?: string;
	hideButtons?: boolean;
	initialData?: any;
	isEditing?: boolean;
	onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function SOPLibraryForm({ sopId, hideButtons, initialData, isEditing, onSubmittingChange }: SOPLibraryFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateSubmittingState = (submitting: boolean) => {
		setIsSubmitting(submitting);
		onSubmittingChange?.(submitting);
	};
	const [isLoading, setIsLoading] = useState(!!sopId && !initialData);

	const form = useForm<SOPLibraryFormData>({
		resolver: zodResolver(sopLibrarySchema),
		defaultValues: initialData
			? {
					title: initialData.title,
					slug: initialData.slug,
					description: initialData.description || "",
					category: initialData.category || "",
					content: initialData.content,
					version: initialData.version,
					status: initialData.status,
					effectiveDate: initialData.effectiveDate ? new Date(initialData.effectiveDate).toISOString().split("T")[0] : "",
				}
			: {
					title: "",
					slug: "",
					description: "",
					category: "",
					content: "",
					status: SOPStatus.DRAFT,
					version: 1,
				},
	});

	const handleTitleChange = (title: string) => {
		form.setValue("title" as keyof SOPLibraryFormData, title);
		if (!sopId) {
			form.setValue("slug" as keyof SOPLibraryFormData, generateSlug(title));
		}
	};

	// Load existing SOP data if editing by sopId
	useEffect(() => {
		const loadData = async () => {
			if (sopId && !initialData) {
				setIsLoading(true);
				const sopResult = await getSOPAction(sopId);
				if (sopResult.success && sopResult.data) {
					const sop = sopResult.data as any;
					form.reset({
						title: sop.title,
						slug: sop.slug,
						description: sop.description || "",
						category: sop.category || "",
						content: sop.content,
						version: sop.version,
						status: sop.status,
						effectiveDate: sop.effectiveDate ? new Date(sop.effectiveDate).toISOString().split("T")[0] : "",
					});
				}
			}
		};
		loadData();
		setIsLoading(false);
	}, [sopId, form, initialData]);

	const onSubmit = async (data: SOPLibraryFormData) => {
		updateSubmittingState(true);
		try {
			const sopIdToUse = sopId || (initialData?.id && isEditing ? initialData.id : null);

			if (sopIdToUse) {
				// Update existing SOP
				const input: UpdateSOPInput = {
					...data,
					effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
				};

				const result = await updateSOPAction(sopIdToUse, input);

				if (result.success) {
					toast.success("SOP library updated successfully");
					router.push(`/training-support/sop-library/${sopIdToUse}`);
					router.refresh();
				} else {
					toast.error(result.message || "Failed to update SOP library");
					updateSubmittingState(false); // Reset submitting state on error
				}
			} else {
				// Create new SOP
				const input: CreateSOPInput = {
					...data,
					effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
				};

				const result = await createSOPAction(input);

				if (result.success) {
					toast.success("SOP library created successfully");
					const resultData = result.data as any;
					router.push(`/training-support/sop-library/${resultData?.id}`);
					router.refresh();
				} else {
					toast.error(result.message || "Failed to create SOP library");
					updateSubmittingState(false); // Reset submitting state on error
				}
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			updateSubmittingState(false);
		}
	};

	if (isLoading) {
		return <Loader size="lg" />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>SOP Library Details</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						data-sop-form
						className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="SOP Title"
												{...field}
												onChange={(e) => handleTitleChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug *</FormLabel>
										<FormControl>
											<Input
												placeholder="sop-slug"
												{...field}
												onChange={(e) => form.setValue("slug" as keyof SOPLibraryFormData, generateSlug(e.target.value))}
											/>
										</FormControl>
										<p className="text-muted-foreground text-xs">{sopId ? "Editable - used in the SOP URL" : "Auto-generated from title - edit after creation if needed"}</p>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<FormControl>
											<Input
												placeholder="Category"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={SOPStatusOptions.DRAFT}>Draft</SelectItem>
												<SelectItem value={SOPStatusOptions.PUBLISHED}>Published</SelectItem>
												<SelectItem value={SOPStatusOptions.ARCHIVED}>Archived</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Describe the SOP"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Content *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="SOP content in HTML or Markdown"
											className="min-h-[200px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!hideButtons && (
							<div className="flex justify-end gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : sopId ? "Update SOP" : "Create SOP"}
								</Button>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
