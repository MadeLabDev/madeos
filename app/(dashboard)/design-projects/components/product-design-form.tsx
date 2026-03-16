"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect, SearchSelectOption } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductDesignStatus } from "@/generated/prisma/enums";
import { createProductDesign, getProductDesignById, updateProductDesign } from "@/lib/features/design/actions";
import { searchDesignProjects } from "@/lib/features/design/actions";

const productDesignSchema = z.object({
	designProjectId: z.string().min(1, "Design project is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	status: z.nativeEnum(ProductDesignStatus),
	designType: z.string().optional(),
	productType: z.string().optional(),
	feasibilityNotes: z.string().optional(),
});

type ProductDesignFormData = z.infer<typeof productDesignSchema>;

interface ProductDesignFormProps {
	productDesignId?: string;
	designProjectId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
	onSuccess?: () => void;
}

export function ProductDesignForm({ productDesignId, designProjectId, hideButtons = false, hideHeader = false, onSuccess }: ProductDesignFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [initialDesignProject, setInitialDesignProject] = useState<SearchSelectOption | null>(null);

	const form = useForm<ProductDesignFormData>({
		resolver: zodResolver(productDesignSchema),
		defaultValues: {
			designProjectId: designProjectId || "",
			name: "",
			description: "",
			status: ProductDesignStatus.DRAFT,
			designType: "",
			productType: "",
			feasibilityNotes: "",
		},
	});

	const loadProductDesign = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getProductDesignById(productDesignId!);
			if (result.success && result.data) {
				// Set initial design project option for AsyncSearchSelect
				if (result.data.designProject) {
					setInitialDesignProject({
						value: result.data.designProject.id,
						label: result.data.designProject.title || `Project ${result.data.designProject.id}`,
					});
				}

				form.reset({
					designProjectId: result.data.designProjectId,
					name: result.data.name,
					description: result.data.description || "",
					status: result.data.status,
					designType: result.data.designType || "",
					productType: result.data.productType || "",
					feasibilityNotes: result.data.feasibilityNotes || "",
				});
			} else {
				toast.error("Failed to load product design");
			}
		} catch (error) {
			toast.error("Failed to load product design");
		} finally {
			setLoading(false);
		}
	}, [productDesignId, form]);

	useEffect(() => {
		if (productDesignId) {
			loadProductDesign();
		}
	}, [productDesignId, loadProductDesign]);

	const onSubmit = async (data: ProductDesignFormData) => {
		try {
			setLoading(true);

			let result;
			if (productDesignId) {
				result = await updateProductDesign(productDesignId, data);
			} else {
				result = await createProductDesign(data);
			}

			if (result.success) {
				toast.success(`Product design ${productDesignId ? "updated" : "created"} successfully`);
				if (onSuccess) {
					onSuccess();
				} else {
					router.push(productDesignId ? `/design-projects/designs/${productDesignId}` : "/design-projects/designs");
				}
			} else {
				toast.error(result.message || `Failed to ${productDesignId ? "update" : "create"} product design`);
			}
		} catch (error) {
			toast.error(`Failed to ${productDesignId ? "update" : "create"} product design`);
		} finally {
			setLoading(false);
		}
	};

	if (loading && productDesignId) {
		return (
			<div className="flex justify-center p-8">
				<Loader />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{!hideHeader && (
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{productDesignId ? "Edit Product Design" : "Create Product Design"}</h2>
					<p className="text-muted-foreground">{productDesignId ? "Update the product design information" : "Enter the product design details"}</p>
				</div>
			)}

			<Form {...form}>
				<form
					id="product-design-form"
					data-product-design-form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Design Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
								)}

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl>
												<Input
													placeholder="Design name"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Status</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value={ProductDesignStatus.DRAFT}>Draft</SelectItem>
														<SelectItem value={ProductDesignStatus.IN_PROGRESS}>In Progress</SelectItem>
														<SelectItem value={ProductDesignStatus.REVIEW}>Review</SelectItem>
														<SelectItem value={ProductDesignStatus.APPROVED}>Approved</SelectItem>
														<SelectItem value={ProductDesignStatus.REJECTED}>Rejected</SelectItem>
														<SelectItem value={ProductDesignStatus.COMPLETED}>Completed</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="productType"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product Type</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., T-Shirt, Mug, Hat"
													{...field}
												/>
											</FormControl>
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
												placeholder="Design description and requirements"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="feasibilityNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Feasibility Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Technical feasibility notes and requirements"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

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
								disabled={loading}>
								{loading && <Loader className="mr-2 h-4 w-4" />}
								{productDesignId ? "Update" : "Create"} Design
							</Button>
						</div>
					)}

					{/* Hidden submit button for header button functionality */}
					{hideButtons && (
						<button
							type="submit"
							className="hidden"
							disabled={loading}>
							Submit
						</button>
					)}
				</form>
			</Form>
		</div>
	);
}
