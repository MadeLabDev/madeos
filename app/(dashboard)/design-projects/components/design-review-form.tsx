"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { createDesignReview, getDesignReview, updateDesignReview } from "@/lib/features/design/actions";
import { getProductDesignForForm, searchDesignProjects, searchProductDesigns } from "@/lib/features/design/actions";
import { getDesignProjectById } from "@/lib/features/design/actions/design-project.actions";

const designReviewSchema = z.object({
	designProjectId: z.string().min(1, "Design project is required"),
	productDesignId: z.string().optional(),
	reviewerName: z.string().min(1, "Reviewer name is required"),
	reviewerEmail: z.string().email().optional().or(z.literal("")),
	feedback: z.string().optional(),
	notes: z.string().optional(),
});

type DesignReviewFormData = z.infer<typeof designReviewSchema>;

interface DesignReviewFormProps {
	designReviewId?: string;
	designProjectId?: string;
	hideHeader?: boolean;
	hideButtons?: boolean;
	onSuccess?: () => void;
}

export function DesignReviewForm({ designReviewId, designProjectId, hideHeader = false, hideButtons = false, onSuccess }: DesignReviewFormProps) {
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(!!designReviewId);
	const [initialDesignProject, setInitialDesignProject] = useState<{ value: string; label: string } | null>(null);
	const [initialProductDesign, setInitialProductDesign] = useState<{ value: string; label: string } | null>(null);

	const form = useForm<DesignReviewFormData>({
		resolver: zodResolver(designReviewSchema),
		defaultValues: {
			designProjectId: designProjectId || "",
			productDesignId: "",
			reviewerName: "",
			reviewerEmail: "",
			feedback: "",
			notes: "",
		},
	});

	useEffect(() => {
		if (designReviewId) {
			const loadDesignReview = async () => {
				try {
					const result = await getDesignReview(designReviewId);
					if (result.success && result.data) {
						// Fetch design project details for initial options
						if (result.data.designProjectId) {
							const projectResult = await getDesignProjectById(result.data.designProjectId);
							if (projectResult.success && projectResult.data) {
								setInitialDesignProject({
									value: projectResult.data.id,
									label: projectResult.data.title || `Project ${projectResult.data.id}`,
								});
							}
						}

						// Fetch product design details for initial options
						if (result.data.productDesignId) {
							const designResult = await getProductDesignForForm(result.data.productDesignId);
							if (designResult.success && designResult.data) {
								setInitialProductDesign({
									value: designResult.data.id,
									label: designResult.data.name || `Design ${designResult.data.id}`,
								});
							}
						}

						form.reset({
							designProjectId: result.data.designProjectId,
							productDesignId: result.data.productDesignId || "",
							reviewerName: result.data.reviewerName,
							reviewerEmail: result.data.reviewerEmail || "",
							feedback: result.data.feedback || "",
							notes: result.data.notes || "",
						});
					} else {
						toast.error("Failed to load design review");
					}
				} catch (error) {
					toast.error("Failed to load design review");
				} finally {
					setInitialLoading(false);
				}
			};

			loadDesignReview();
		}
	}, [designReviewId, form]);

	const onSubmit = async (data: DesignReviewFormData) => {
		try {
			setLoading(true);
			const result = designReviewId ? await updateDesignReview(designReviewId, data) : await createDesignReview(data);

			if (result.success) {
				toast.success(designReviewId ? "Design review updated successfully" : "Design review created successfully");
				if (onSuccess) {
					onSuccess();
				} else {
					// Trigger form submission success for parent components
					window.dispatchEvent(
						new CustomEvent("design-review-form-success", {
							detail: { data: result.data },
						}),
					);
				}
			} else {
				toast.error(result.message || `Failed to ${designReviewId ? "update" : "create"} design review`);
			}
		} catch (error) {
			toast.error(`Failed to ${designReviewId ? "update" : "create"} design review`);
		} finally {
			setLoading(false);
		}
	};

	if (initialLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader className="h-8 w-8" />
			</div>
		);
	}

	const formContent = (
		<Form {...form}>
			<form
				id="design-review-form"
				data-design-review-form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{!designProjectId && (
						<FormField
							control={form.control}
							name="designProjectId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Design Project *</FormLabel>
									<FormControl>
										<AsyncSearchSelect
											placeholder="Search design projects..."
											value={field.value}
											onValueChange={field.onChange}
											fetchOptions={async (query: string) => {
												const result = await searchDesignProjects(query);
												if (result.success && result.data) {
													return result.data.map((project) => ({
														value: project.id,
														label: project.title || `Project ${project.id}`,
													}));
												}
												return [];
											}}
											initialOptions={initialDesignProject ? [initialDesignProject] : []}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					)}{" "}
					<FormField
						control={form.control}
						name="productDesignId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Product Design (Optional)</FormLabel>
								<FormControl>
									<AsyncSearchSelect
										placeholder="Search product designs..."
										value={field.value}
										onValueChange={field.onChange}
										fetchOptions={async (query: string) => {
											const result = await searchProductDesigns(query);
											if (result.success && result.data) {
												return result.data;
											}
											return [];
										}}
										initialOptions={initialProductDesign ? [initialProductDesign] : []}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="reviewerName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Reviewer Name *</FormLabel>
								<FormControl>
									<Input
										placeholder="Reviewer's full name"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="reviewerEmail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Reviewer Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="reviewer@example.com"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="feedback"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Feedback</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Detailed feedback and comments"
									className="min-h-[150px]"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Additional Notes</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Any additional notes or context"
									className="min-h-[100px]"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				{!hideButtons && (
					<div className="flex justify-end space-x-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => window.history.back()}
							disabled={loading}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}>
							{loading && <Loader className="mr-2 h-4 w-4" />}
							{designReviewId ? "Update Design Review" : "Create Design Review"}
						</Button>
					</div>
				)}
			</form>
		</Form>
	);

	if (hideHeader) {
		return formContent;
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{designReviewId ? "Edit Design Review" : "Create New Design Review"}</CardTitle>
				</CardHeader>
				<CardContent>{formContent}</CardContent>
			</Card>
		</div>
	);
}
