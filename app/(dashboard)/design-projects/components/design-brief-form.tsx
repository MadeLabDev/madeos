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
import { DesignBriefStatus } from "@/generated/prisma/enums";
import { createDesignBrief, getDesignBriefById, getDesignBriefByProjectId, searchDesignProjects, updateDesignBrief } from "@/lib/features/design/actions";

const designBriefSchema = z.object({
	designProjectId: z.string().min(1, "Design project is required"),
	brandAssets: z.string().optional(),
	targetAudience: z.string().optional(),
	constraints: z.string().optional(),
	inspirations: z.string().optional(),
	deliverables: z.string().optional(),
	budget: z.number().optional(),
	timeline: z.string().optional(),
	notes: z.string().optional(),
	status: z.nativeEnum(DesignBriefStatus).optional(),
});

type DesignBriefFormData = z.infer<typeof designBriefSchema>;

interface DesignBriefFormProps {
	designProjectId?: string;
	designBriefId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function DesignBriefForm({ designProjectId, designBriefId, hideButtons = false, hideHeader = false }: DesignBriefFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [initialDesignProject, setInitialDesignProject] = useState<SearchSelectOption | null>(null);
	const [existingBriefWarning, setExistingBriefWarning] = useState<string | null>(null);

	const form = useForm<DesignBriefFormData>({
		resolver: zodResolver(designBriefSchema),
		defaultValues: {
			designProjectId: designProjectId || "",
			brandAssets: "",
			targetAudience: "",
			constraints: "",
			inspirations: "",
			deliverables: "",
			budget: undefined,
			timeline: "",
			notes: "",
			status: DesignBriefStatus.DRAFT,
		},
	});
	const loadDesignBrief = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignBriefById(designBriefId!);
			if (result.success && result.data) {
				// Set initial design project option for AsyncSearchSelect
				const data = result.data as any;
				if (data.designProject) {
					setInitialDesignProject({
						value: data.designProject.id,
						label: data.designProject.title || `Project ${data.designProject.id}`,
					});
				}

				form.reset({
					designProjectId: data.designProjectId,
					brandAssets: data.brandAssets || "",
					targetAudience: data.targetAudience || "",
					constraints: data.constraints || "",
					inspirations: data.inspirations || "",
					deliverables: data.deliverables || "",
					budget: data.budget || undefined,
					timeline: data.timeline || "",
					notes: data.notes || "",
					status: data.status,
				});
			} else {
				toast.error("Failed to load design brief");
			}
		} catch (error) {
			toast.error("Failed to load design brief");
		} finally {
			setLoading(false);
		}
	}, [designBriefId, form, setInitialDesignProject, setLoading]);

	useEffect(() => {
		if (designBriefId) {
			loadDesignBrief();
		}
	}, [designBriefId, loadDesignBrief]);

	const checkExistingBrief = async (projectId: string) => {
		if (!projectId || designBriefId) return; // Skip check when editing existing brief

		try {
			const result = await getDesignBriefByProjectId(projectId);
			if (result.success && result.data) {
				setExistingBriefWarning(`A design brief already exists for this project. You can edit it instead.`);
			} else {
				setExistingBriefWarning(null);
			}
		} catch (error) {
			console.error("Failed to check existing brief:", error);
			setExistingBriefWarning(null);
		}
	};

	const onSubmit = async (data: DesignBriefFormData) => {
		try {
			setLoading(true);

			let result;
			if (designBriefId) {
				result = await updateDesignBrief(designBriefId, data as any);
			} else {
				result = await createDesignBrief(data as any);
			}

			if (result.success) {
				toast.success(`Design brief ${designBriefId ? "updated" : "created"} successfully`);
				router.push(designBriefId ? `/design-projects/briefs/${designBriefId}` : "/design-projects/briefs");
			} else {
				toast.error(result.message || `Failed to ${designBriefId ? "update" : "create"} design brief`);
			}
		} catch (error) {
			toast.error(`Failed to ${designBriefId ? "update" : "create"} design brief`);
		} finally {
			setLoading(false);
		}
	};

	if (loading && designBriefId) {
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
					<h2 className="text-2xl font-bold tracking-tight">{designBriefId ? "Edit Design Brief" : "Create Design Brief"}</h2>
					<p className="text-muted-foreground">{designBriefId ? "Update the design brief information" : "Enter the design brief details"}</p>
				</div>
			)}

			<Form {...form}>
				<form
					data-design-brief-form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Brief Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
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
													checkExistingBrief(value);
												}}
												fetchOptions={async (query: string) => {
													const result = await searchDesignProjects(query);
													if (result.success && result.data) {
														return (result.data as any[]).map((project: any) => ({
															value: project.id,
															label: project.title || `Project ${project.id}`,
														}));
													}
													return [];
												}}
												initialOptions={initialDesignProject ? [initialDesignProject] : []}
											/>
										</FormControl>
										{existingBriefWarning && <p className="mt-1 text-sm text-amber-600">{existingBriefWarning}</p>}
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="brandAssets"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Brand Assets</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe brand assets, logos, colors, etc."
													rows={3}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="targetAudience"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Target Audience</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe the target audience"
													rows={3}
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
									name="constraints"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Constraints</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Technical constraints, size limitations, etc."
													rows={3}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="inspirations"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Inspirations</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Design inspirations, references, etc."
													rows={3}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="deliverables"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Deliverables</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What needs to be delivered"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<FormField
									control={form.control}
									name="budget"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Budget</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="0.00"
													{...field}
													onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
													value={field.value || ""}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="timeline"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Timeline</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g., 4 weeks"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

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
														<SelectItem value={DesignBriefStatus.DRAFT}>Pending</SelectItem>
														<SelectItem value={DesignBriefStatus.APPROVED}>Approved</SelectItem>
														<SelectItem value={DesignBriefStatus.REJECTED}>Rejected</SelectItem>
														<SelectItem value={DesignBriefStatus.SUBMITTED}>Submitted</SelectItem>
														<SelectItem value={DesignBriefStatus.REVISION_REQUESTED}>Revision Requested</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>{" "}
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Additional Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Any additional notes or requirements"
												rows={4}
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
								disabled={loading || !!existingBriefWarning}>
								{loading && <Loader className="mr-2 h-4 w-4" />}
								{designBriefId ? "Update" : "Create"} Brief
							</Button>
						</div>
					)}

					{/* Hidden submit button for header button functionality */}
					{hideButtons && (
						<button
							type="submit"
							className="hidden"
							disabled={loading || !!existingBriefWarning}>
							Submit
						</button>
					)}
				</form>
			</Form>
		</div>
	);
}
