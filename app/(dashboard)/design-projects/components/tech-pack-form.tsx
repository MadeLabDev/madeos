"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FileUploadField } from "@/components/form-fields/file-upload-field";
import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TechPackStatus } from "@/generated/prisma/enums";
import { createTechPack, getTechPackById, updateTechPack } from "@/lib/features/design/actions";
import { getProductDesignForForm, searchProductDesigns } from "@/lib/features/design/actions";

const techPackSchema = z.object({
	productDesignId: z.string().min(1, "Product design is required"),
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	decorationMethod: z.string().min(1, "Decoration method is required"),
	productionNotes: z.string().optional(),
	outputFiles: z.array(z.string()).optional(),
	status: z.nativeEnum(TechPackStatus),
});

type TechPackFormData = z.infer<typeof techPackSchema>;

interface TechPackFormProps {
	techPackId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function TechPackForm({ techPackId, hideButtons = false, hideHeader = false }: TechPackFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [initialProductDesign, setInitialProductDesign] = useState<{ value: string; label: string } | null>(null);

	const form = useForm<TechPackFormData>({
		resolver: zodResolver(techPackSchema),
		defaultValues: {
			productDesignId: "",
			name: "",
			description: "",
			decorationMethod: "",
			productionNotes: "",
			outputFiles: [],
			status: TechPackStatus.DRAFT,
		},
	});

	const loadTechPack = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTechPackById(techPackId!);
			if (result.success && result.data) {
				// Fetch the selected product design details for proper display
				if (result.data.productDesignId) {
					const designResult = await getProductDesignForForm(result.data.productDesignId);
					if (designResult.success && designResult.data) {
						setInitialProductDesign({
							value: designResult.data.id,
							label: designResult.data.name || `Design ${designResult.data.id}`,
						});
					}
				}

				// Parse outputFiles from string to array
				let outputFiles: string[] = [];
				if (result.data.outputFiles) {
					try {
						// Try to parse as JSON array first
						const parsed = JSON.parse(result.data.outputFiles);
						outputFiles = Array.isArray(parsed) ? parsed : [result.data.outputFiles];
					} catch {
						// If not JSON, treat as single file path
						outputFiles = [result.data.outputFiles];
					}
				}

				form.reset({
					productDesignId: result.data.productDesignId,
					name: result.data.name,
					description: result.data.description || "",
					decorationMethod: result.data.decorationMethod,
					productionNotes: result.data.productionNotes || "",
					outputFiles,
					status: result.data.status,
				});
			} else {
				toast.error("Failed to load tech pack");
			}
		} catch (error) {
			toast.error("Failed to load tech pack");
		} finally {
			setLoading(false);
		}
	}, [techPackId, form]);

	useEffect(() => {
		if (techPackId) {
			loadTechPack();
		}
	}, [techPackId, loadTechPack]);

	const onSubmit = async (data: TechPackFormData) => {
		try {
			setLoading(true);

			// Convert outputFiles array to string for database storage
			const submitData = {
				...data,
				outputFiles: data.outputFiles && data.outputFiles.length > 0 ? JSON.stringify(data.outputFiles) : undefined,
			};

			let result;
			if (techPackId) {
				result = await updateTechPack(techPackId, submitData);
			} else {
				result = await createTechPack(submitData);
			}

			if (result.success) {
				toast.success(`Tech pack ${techPackId ? "updated" : "created"} successfully`);
				router.push(techPackId ? `/design-projects/tech-packs/${techPackId}` : "/design-projects/tech-packs");
			} else {
				toast.error(result.message || `Failed to ${techPackId ? "update" : "create"} tech pack`);
			}
		} catch (error) {
			toast.error(`Failed to ${techPackId ? "update" : "create"} tech pack`);
		} finally {
			setLoading(false);
		}
	};

	if (loading && techPackId) {
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
					<h2 className="text-2xl font-bold tracking-tight">{techPackId ? "Edit Tech Pack" : "Create Tech Pack"}</h2>
					<p className="text-muted-foreground">{techPackId ? "Update the tech pack information" : "Enter the tech pack details"}</p>
				</div>
			)}

			<Form {...form}>
				<form
					data-testid="tech-pack-form"
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Tech Pack Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="productDesignId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product Design *</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													placeholder="Search product designs..."
													value={field.value}
													onValueChange={field.onChange}
													initialOptions={initialProductDesign ? [initialProductDesign] : []}
													fetchOptions={async (query: string) => {
														const result = await searchProductDesigns(query);
														if (result.success && result.data) {
															return result.data;
														}
														return [];
													}}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name *</FormLabel>
											<FormControl>
												<Input
													placeholder="Tech pack name"
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
														<SelectItem value={TechPackStatus.DRAFT}>Draft</SelectItem>
														<SelectItem value={TechPackStatus.IN_PROGRESS}>In Progress</SelectItem>
														<SelectItem value={TechPackStatus.REVIEW}>Review</SelectItem>
														<SelectItem value={TechPackStatus.APPROVED}>Approved</SelectItem>
														<SelectItem value={TechPackStatus.REJECTED}>Rejected</SelectItem>
														<SelectItem value={TechPackStatus.FINALIZED}>Finalized</SelectItem>
														<SelectItem value={TechPackStatus.ARCHIVED}>Archived</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="decorationMethod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Decoration Method *</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., Screen Print, DTG, Embroidery"
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
												placeholder="Tech pack description and specifications"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="productionNotes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Production Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Additional production notes and requirements"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="outputFiles"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<FileUploadField
												label="Output Files"
												value={field.value}
												onChange={field.onChange}
												description="Upload final tech pack files (PDFs, ZIPs, design files, etc.)"
												accept=".pdf,.zip,.ai,.eps,.svg,.png,.jpg,.jpeg"
												maxFiles={10}
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
								{techPackId ? "Update" : "Create"} Tech Pack
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
