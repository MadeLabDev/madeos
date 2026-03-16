"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { SearchSelectOption } from "@/components/ui/async-search-select";
import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DesignProjectStatus } from "@/generated/prisma/enums";
import { PRIORITY_LEVELS } from "@/lib/config/module-types";
import { type PriorityLevel } from "@/lib/config/module-types";
import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";
import { getEngagementsAction } from "@/lib/features/customers/actions";
import { createDesignProject, getDesignProjectById, updateDesignProject } from "@/lib/features/design/actions";
import { searchCustomers, searchEngagements, searchUsers } from "@/lib/features/design/actions/search.actions";
import { getUserByIdAction } from "@/lib/features/users/actions/user-actions";
import { cn } from "@/lib/utils";

const designProjectSchema = z.object({
	engagementId: z.string().min(1, "Engagement is required"),
	customerId: z.string().min(1, "Customer is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	status: z.nativeEnum(DesignProjectStatus as any),
	priority: z.enum(PRIORITY_LEVELS.map((p) => p.value) as [PriorityLevel, ...PriorityLevel[]]),
	requestedBy: z.string().min(1, "Requested by is required"),
	assignedTo: z.string().optional(),
	startDate: z.date().optional(),
	dueDate: z.date().optional(),
	budget: z.number().optional(),
});

type DesignProjectFormData = z.infer<typeof designProjectSchema>;

interface DesignProjectFormProps {
	designProjectId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function DesignProjectForm({ designProjectId, hideButtons = false, hideHeader = false }: DesignProjectFormProps) {
	const router = useRouter();
	const { setOverride } = useBreadcrumb();
	const [loading, setLoading] = useState(false);
	const [engagements, setEngagements] = useState<any[]>([]);
	const [initialEngagement, setInitialEngagement] = useState<SearchSelectOption | null>(null);
	const [initialCustomer, setInitialCustomer] = useState<SearchSelectOption | null>(null);
	const [initialRequestedBy, setInitialRequestedBy] = useState<SearchSelectOption | null>(null);
	const [initialAssignedTo, setInitialAssignedTo] = useState<SearchSelectOption | null>(null);

	// Wrapper functions for AsyncSearchSelect
	const fetchEngagements = async (query: string) => {
		const result = await searchEngagements(query);
		return result.success ? result.data : [];
	};

	const fetchCustomers = async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	};

	const fetchUsers = async (query: string) => {
		const result = await searchUsers(query);
		return result.success ? result.data : [];
	};

	const form = useForm<DesignProjectFormData>({
		resolver: zodResolver(designProjectSchema),
		defaultValues: {
			engagementId: "",
			customerId: "",
			title: "",
			description: "",
			status: DesignProjectStatus.DRAFT,
			priority: "MEDIUM",
			requestedBy: "",
			assignedTo: "",
			startDate: undefined,
			dueDate: undefined,
			budget: undefined,
		},
	});

	const loadData = useCallback(async () => {
		try {
			// Load engagements
			const engagementsResult = await getEngagementsAction();
			if (engagementsResult.success && engagementsResult.data) {
				setEngagements((engagementsResult.data as any).engagements || []);
			}

			// Load users
			const usersResult = await searchUsers("");
			if (usersResult.success && usersResult.data) {
				// Users loaded but not stored in state since they're fetched dynamically
			}
		} catch (error) {
			console.error("Failed to load data:", error);
		}
	}, []);

	const loadDesignProject = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignProjectById(designProjectId!);
			if (result.success && result.data) {
				await loadData();

				// Set breadcrumb override
				setOverride(designProjectId!, result.data.title);

				// Set initial options for AsyncSearchSelect components
				if (result.data.engagement) {
					setInitialEngagement({
						value: result.data.engagement.id,
						label: result.data.engagement.title,
						description: `${result.data.customer?.companyName || "Unknown"} - ${result.data.engagement.description?.slice(0, 50)}${result.data.engagement.description && result.data.engagement.description.length > 50 ? "..." : ""}`,
					});
				}

				if (result.data.customer) {
					setInitialCustomer({
						value: result.data.customer.id,
						label: result.data.customer.companyName,
						description: result.data.customer.email,
					});
				}

				// For users, we need to fetch the user data
				if (result.data.requestedBy) {
					try {
						const requestedByResult = await getUserByIdAction(result.data.requestedBy);
						if (requestedByResult.success && requestedByResult.data) {
							const user = requestedByResult.data as any;
							setInitialRequestedBy({
								value: user.id,
								label: user.name,
								description: user.email,
							});
						}
					} catch (error) {
						console.error("Failed to load requested by user:", error);
					}
				}
				if (result.data.assignedTo) {
					try {
						const assignedToResult = await getUserByIdAction(result.data.assignedTo);
						if (assignedToResult.success && assignedToResult.data) {
							const user = assignedToResult.data as any;
							setInitialAssignedTo({
								value: user.id,
								label: user.name,
								description: user.email,
							});
						}
					} catch (error) {
						console.error("Failed to load assigned to user:", error);
					}
				}
				form.reset({
					engagementId: result.data.engagementId,
					customerId: result.data.customerId,
					title: result.data.title,
					description: result.data.description || "",
					status: result.data.status,
					priority: result.data.priority as PriorityLevel,
					requestedBy: result.data.requestedBy,
					assignedTo: result.data.assignedTo || "",
					startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
					dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
					budget: result.data.budget || undefined,
				});
			} else {
				toast.error("Failed to load design project");
			}
		} catch (error) {
			toast.error("Failed to load design project");
		} finally {
			setLoading(false);
		}
	}, [designProjectId, loadData, setOverride, form]);

	useEffect(() => {
		if (designProjectId) {
			loadDesignProject();
		} else {
			loadData();
		}
	}, [designProjectId, loadDesignProject, loadData]);

	const onSubmit = async (data: DesignProjectFormData) => {
		try {
			setLoading(true);

			// Ensure customerId is set from engagement
			const selectedEngagement = engagements.find((e) => e.id === data.engagementId);
			if (selectedEngagement && !data.customerId) {
				data.customerId = selectedEngagement.customerId;
			}

			let result;
			if (designProjectId) {
				result = await updateDesignProject(designProjectId, data);
			} else {
				result = await createDesignProject(data);
			}

			if (result.success) {
				toast.success(`Design project ${designProjectId ? "updated" : "created"} successfully`);
				router.push(`/design-projects/projects/${result.data?.id || designProjectId}`);
			} else {
				toast.error(result.message || `Failed to ${designProjectId ? "update" : "create"} design project`);
			}
		} catch (error) {
			toast.error(`Failed to ${designProjectId ? "update" : "create"} design project`);
		} finally {
			setLoading(false);
		}
	};

	if (loading && designProjectId) {
		return (
			<div className="flex justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{!hideHeader && (
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{designProjectId ? "Edit Design Project" : "Design Project Details"}</h2>
					<p className="text-muted-foreground">{designProjectId ? "Update the design project information" : "Enter the basic information for the design project"}</p>
				</div>
			)}

			<Form {...form}>
				<form
					id="design-project-form"
					data-design-project-form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="engagementId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Engagement *</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													placeholder="Search engagements..."
													fetchOptions={fetchEngagements}
													value={field.value}
													onValueChange={(value) => {
														field.onChange(value);
														// Auto-set customer when engagement changes
														const engagement = engagements.find((e) => e.id === value);
														if (engagement) {
															form.setValue("customerId", engagement.customerId);
															setInitialCustomer({
																value: engagement.customer.id,
																label: engagement.customer.companyName,
																description: engagement.customer.email,
															});
														}
													}}
													initialOptions={initialEngagement ? [initialEngagement] : []}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="customerId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Customer *</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													placeholder="Search customers..."
													value={field.value}
													onValueChange={field.onChange}
													fetchOptions={fetchCustomers}
													initialOptions={initialCustomer ? [initialCustomer] : []}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter design project title"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter design project description"
												rows={3}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
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
														<SelectItem value={DesignProjectStatus.DRAFT}>Draft</SelectItem>
														<SelectItem value={DesignProjectStatus.INTAKE}>Intake</SelectItem>
														<SelectItem value={DesignProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
														<SelectItem value={DesignProjectStatus.REVIEW}>Review</SelectItem>
														<SelectItem value={DesignProjectStatus.APPROVED}>Approved</SelectItem>
														<SelectItem value={DesignProjectStatus.REJECTED}>Rejected</SelectItem>
														<SelectItem value={DesignProjectStatus.REVISION}>Revision</SelectItem>
														<SelectItem value={DesignProjectStatus.COMPLETED}>Completed</SelectItem>
														<SelectItem value={DesignProjectStatus.ARCHIVED}>Archived</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="priority"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Priority</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{PRIORITY_LEVELS.map((priority) => (
															<SelectItem
																key={priority.value}
																value={priority.value}>
																{priority.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="requestedBy"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Requested By *</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													placeholder="Search users..."
													fetchOptions={fetchUsers}
													value={field.value}
													onValueChange={field.onChange}
													initialOptions={initialRequestedBy ? [initialRequestedBy] : []}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="assignedTo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Assigned To</FormLabel>
											<FormControl>
												<AsyncSearchSelect
													placeholder="Search users..."
													fetchOptions={fetchUsers}
													value={field.value}
													onValueChange={field.onChange}
													initialOptions={initialAssignedTo ? [initialAssignedTo] : []}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Start Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
															{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) => date < new Date("1900-01-01")}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="dueDate"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Due Date</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
															{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
															<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) => date < new Date("1900-01-01")}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										</FormItem>
									)}
								/>

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
							</div>
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
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								<Save className="mr-2 h-4 w-4" />
								{designProjectId ? "Update" : "Create"} Design Project
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
