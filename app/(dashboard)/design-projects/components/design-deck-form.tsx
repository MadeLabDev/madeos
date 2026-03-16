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
import { MultiSelectField } from "@/components/ui/multi-select-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DesignDeckStatus } from "@/generated/prisma/enums";
import { createDesignDeck, getDesignDeckById, getDesignProjectById, updateDesignDeck } from "@/lib/features/design/actions";
import { getProductDesignsByIds, searchDesignProjects, searchProductDesignsByProject } from "@/lib/features/design/actions";

const designDeckSchema = z.object({
	designProjectId: z.string().min(1, "Design project is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	coverUrl: z.string().optional(),
	designIds: z.array(z.string()).optional(),
	deckUrl: z.string().optional(),
	mediaIds: z.array(z.string()).optional(),
	status: z.nativeEnum(DesignDeckStatus),
	notes: z.string().optional(),
});

type DesignDeckFormData = z.infer<typeof designDeckSchema>;

interface DesignDeckFormProps {
	designDeckId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function DesignDeckForm({ designDeckId, hideButtons = false, hideHeader = false }: DesignDeckFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedDesignProjectId, setSelectedDesignProjectId] = useState<string>("");
	const [designProjectOptions, setDesignProjectOptions] = useState<Array<{ value: string; label: string }>>([]);

	const form = useForm<DesignDeckFormData>({
		resolver: zodResolver(designDeckSchema),
		defaultValues: {
			designProjectId: "",
			title: "",
			description: "",
			coverUrl: "",
			designIds: [],
			deckUrl: "",
			mediaIds: [],
			status: DesignDeckStatus.DRAFT,
			notes: "",
		},
	});
	const loadDesignDeck = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignDeckById(designDeckId!);
			if (result.success && result.data) {
				const designIds = result.data.designIds ? result.data.designIds.split(",").filter(Boolean) : [];

				// Parse mediaIds from string to array
				let mediaIds: string[] = [];
				if (result.data.mediaIds) {
					try {
						// Try to parse as JSON array first
						const parsed = JSON.parse(result.data.mediaIds);
						mediaIds = Array.isArray(parsed) ? parsed : [result.data.mediaIds];
					} catch {
						// If not JSON, treat as single file path
						mediaIds = [result.data.mediaIds];
					}
				}

				setSelectedDesignProjectId(result.data.designProjectId);

				// Fetch design project details for initial options
				const projectResult = await getDesignProjectById(result.data.designProjectId);
				if (projectResult.success && projectResult.data) {
					setDesignProjectOptions([
						{
							value: projectResult.data.id,
							label: projectResult.data.title || `Project ${projectResult.data.id}`,
						},
					]);
				}

				form.reset({
					designProjectId: result.data.designProjectId,
					title: result.data.title,
					description: result.data.description || "",
					coverUrl: result.data.coverUrl || "",
					designIds,
					deckUrl: result.data.deckUrl || "",
					mediaIds,
					status: result.data.status,
					notes: result.data.notes || "",
				});
			} else {
				toast.error("Failed to load design deck");
			}
		} catch (error) {
			toast.error("Failed to load design deck");
		} finally {
			setLoading(false);
		}
	}, [designDeckId, form, setSelectedDesignProjectId, setDesignProjectOptions, setLoading]);

	useEffect(() => {
		if (designDeckId) {
			loadDesignDeck();
		}
	}, [designDeckId, loadDesignDeck]);

	const onSubmit = async (data: DesignDeckFormData) => {
		try {
			setLoading(true);

			// Convert arrays back to strings for the API
			const submitData = {
				...data,
				designIds: data.designIds?.join(",") || "",
				mediaIds: data.mediaIds && data.mediaIds.length > 0 ? JSON.stringify(data.mediaIds) : undefined,
			};

			let result;
			if (designDeckId) {
				result = await updateDesignDeck(designDeckId, submitData);
			} else {
				result = await createDesignDeck(submitData);
			}

			if (result.success) {
				toast.success(`Design deck ${designDeckId ? "updated" : "created"} successfully`);
				router.push(designDeckId ? `/design-projects/design-decks/${designDeckId}` : "/design-projects/design-decks");
			} else {
				toast.error(result.message || `Failed to ${designDeckId ? "update" : "create"} design deck`);
			}
		} catch (error) {
			toast.error(`Failed to ${designDeckId ? "update" : "create"} design deck`);
		} finally {
			setLoading(false);
		}
	};

	if (loading && designDeckId) {
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
					<h2 className="text-2xl font-bold tracking-tight">{designDeckId ? "Edit Design Deck" : "Create Design Deck"}</h2>
					<p className="text-muted-foreground">{designDeckId ? "Update the design deck information" : "Enter the design deck details"}</p>
				</div>
			)}

			<Form {...form}>
				<form
					data-design-deck-form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Design Deck Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
													onValueChange={(value) => {
														field.onChange(value);
														setSelectedDesignProjectId(value);
													}}
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
													initialOptions={designProjectOptions}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title *</FormLabel>
											<FormControl>
												<Input
													placeholder="Design deck title"
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
									name="coverUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cover URL</FormLabel>
											<FormControl>
												<Input
													placeholder="https://..."
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="deckUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Deck URL</FormLabel>
											<FormControl>
												<Input
													placeholder="https://..."
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4">
								<FormField
									control={form.control}
									name="designIds"
									render={({ field }) => (
										<MultiSelectField
											label="Design"
											value={field.value || []}
											onChange={field.onChange}
											fetchOptions={async (query: string) => {
												if (!selectedDesignProjectId) return [];
												const result = await searchProductDesignsByProject(selectedDesignProjectId, query);
												return result.success ? result.data : [];
											}}
											loadSelectedOptions={async (ids: string[]) => {
												const result = await getProductDesignsByIds(ids);
												return result.success ? result.data : [];
											}}
											placeholder="Select product designs..."
											searchPlaceholder="Search designs..."
											emptyMessage="No designs found for this project."
											maxItems={20}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="mediaIds"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<FileUploadField
													label="Media Files"
													value={field.value}
													onChange={field.onChange}
													description="Upload media files (images, documents, videos, etc.) for this design deck"
													accept=".pdf,.zip,.ai,.eps,.svg,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi"
													maxFiles={20}
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
														<SelectItem value={DesignDeckStatus.DRAFT}>Draft</SelectItem>
														<SelectItem value={DesignDeckStatus.IN_PROGRESS}>In Progress</SelectItem>
														<SelectItem value={DesignDeckStatus.REVIEW}>Review</SelectItem>
														<SelectItem value={DesignDeckStatus.PUBLISHED}>Published</SelectItem>
														<SelectItem value={DesignDeckStatus.ARCHIVED}>Archived</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>

								<div></div>
							</div>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Design deck description and purpose"
												rows={3}
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
												placeholder="Any additional notes or requirements"
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
								{designDeckId ? "Update" : "Create"} Design Deck
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
