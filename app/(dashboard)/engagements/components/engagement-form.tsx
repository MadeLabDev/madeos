"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect, type SearchSelectOption } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ENGAGEMENT_TYPES, type EngagementType, PRIORITY_LEVELS, type PriorityLevel } from "@/lib/config/module-types";
import { ENGAGEMENT_STATUSES, type EngagementStatus } from "@/lib/config/module-types";
import { createEngagementAction, updateEngagementAction } from "@/lib/features/customers/actions";
import type { CreateEngagementInput, EngagementResponse, UpdateEngagementInput } from "@/lib/features/customers/types";
import { searchCustomers } from "@/lib/features/design/actions/search.actions";
import { getUsersAction } from "@/lib/features/users/actions";
import { cn } from "@/lib/utils";

const engagementSchema = z.object({
	customerId: z.string().min(1, "Customer is required"),
	title: z.string().min(1, "Title is required"),
	type: z.enum(ENGAGEMENT_TYPES.map((t) => t.value) as [EngagementType, ...EngagementType[]]),
	status: z.enum(ENGAGEMENT_STATUSES.map((s) => s.value) as [EngagementStatus, ...EngagementStatus[]]).optional(),
	priority: z.enum(PRIORITY_LEVELS.map((p) => p.value) as [PriorityLevel, ...PriorityLevel[]]).optional(),
	startDate: z.date().optional(),
	dueDate: z.date().optional(),
	budget: z.number().min(0).optional(),
	description: z.string().optional(),
	assignedTo: z.string().optional(),
});

type EngagementFormData = z.infer<typeof engagementSchema>;

interface EngagementFormProps {
	engagement?: EngagementResponse;
	onSuccess?: () => void;
	hideButtons?: boolean;
}

export function EngagementForm({ engagement, onSuccess, hideButtons = false }: EngagementFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [initialCustomer, setInitialCustomer] = useState<SearchSelectOption | null>(null);

	// Wrapper functions for AsyncSearchSelect
	const fetchCustomersOptions = async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	};

	const fetchUsers = async (query: string) => {
		try {
			const result = await getUsersAction({
				pageSize: 50,
				search: query || undefined,
			});
			if (result.success && result.data) {
				const users = (result.data as any).users || [];
				// Format users to match SearchSelectOption interface and remove duplicates
				const formattedUsers = users
					.filter((user: any) => user.id && user.name) // Ensure valid data
					.map((user: any) => ({
						value: user.id,
						label: user.name,
						description: user.email || undefined,
					}))
					.filter(
						(user: any, index: number, self: any[]) =>
							// Remove duplicates based on value
							index === self.findIndex((u) => u.value === user.value),
					);
				return formattedUsers;
			}
			return [];
		} catch (error) {
			console.error("Failed to fetch users:", error);
			return [];
		}
	};

	const isEditing = !!engagement;

	const form = useForm<EngagementFormData>({
		resolver: zodResolver(engagementSchema),
		defaultValues: {
			customerId: engagement?.customerId || "",
			title: engagement?.title || "",
			type: (engagement?.type as EngagementType) || "DESIGN",
			status: (engagement?.status as EngagementStatus) || "DRAFT",
			priority: (engagement?.priority as PriorityLevel) || "MEDIUM",
			startDate: engagement?.startDate ? new Date(engagement.startDate) : undefined,
			dueDate: engagement?.dueDate ? new Date(engagement.dueDate) : undefined,
			budget: engagement?.budget || undefined,
			description: engagement?.description || "",
			assignedTo: engagement?.assignedTo || "unassigned",
		},
	});

	// Load initial data if editing
	useEffect(() => {
		if (isEditing && engagement?.customer) {
			setInitialCustomer({
				value: engagement.customer.id,
				label: engagement.customer.companyName,
				description: engagement.customer.email,
			});
		}
	}, [isEditing, engagement?.customer]);

	const onSubmit = async (data: EngagementFormData) => {
		setLoading(true);
		try {
			const formData = {
				...data,
				startDate: data.startDate?.toISOString(),
				dueDate: data.dueDate?.toISOString(),
				assignedTo: data.assignedTo === "unassigned" ? null : data.assignedTo,
			};

			let result;
			if (isEditing) {
				result = await updateEngagementAction(engagement.id, formData as UpdateEngagementInput);
			} else {
				result = await createEngagementAction(formData as CreateEngagementInput);
			}

			if (result.success) {
				toast.success(`Engagement ${isEditing ? "updated" : "created"} successfully`);
				if (onSuccess) {
					onSuccess();
				} else {
					router.push("/engagements");
				}
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error(`Failed to ${isEditing ? "update" : "create"} engagement`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="mx-auto w-full">
			<CardHeader>
				<CardTitle>{isEditing ? "Edit Engagement" : "Create New Engagement"}</CardTitle>
				<CardDescription>{isEditing ? "Update the engagement details below." : "Fill in the details to create a new engagement."}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-engagement-form>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Customer */}
							<FormField
								control={form.control}
								name="customerId"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Customer *</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												placeholder="Search customers..."
												value={field.value}
												onValueChange={field.onChange}
												fetchOptions={fetchCustomersOptions}
												initialOptions={initialCustomer ? [initialCustomer] : []}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Title *</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter engagement title"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Type */}
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{ENGAGEMENT_TYPES.map((type) => (
													<SelectItem
														key={type.value}
														value={type.value}>
														{type.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							{/* Status */}
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{ENGAGEMENT_STATUSES.map((status) => (
													<SelectItem
														key={status.value}
														value={status.value}>
														{status.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							{/* Priority */}
							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Priority</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select priority" />
												</SelectTrigger>
											</FormControl>
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
									</FormItem>
								)}
							/>

							{/* Budget */}
							<FormField
								control={form.control}
								name="budget"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Budget</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												placeholder="0.00"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Start Date */}
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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

							{/* Due Date */}
							<FormField
								control={form.control}
								name="dueDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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

							{/* Assigned To */}
							<FormField
								control={form.control}
								name="assignedTo"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Assigned To</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												value={field.value || "unassigned"}
												onValueChange={(value) => field.onChange(value === "unassigned" ? null : value)}
												fetchOptions={async (query: string) => {
													const users = await fetchUsers(query);
													return [{ value: "unassigned", label: "Unassigned", description: "No one assigned" }, ...users];
												}}
												placeholder="Search and select assignee"
												searchPlaceholder="Search users..."
												emptyMessage="No users found."
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Enter engagement description"
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{!hideButtons && (
							<div className="flex gap-4 pt-6">
								<Button
									type="submit"
									disabled={loading}
									className="flex-1">
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{isEditing ? "Update Engagement" : "Create Engagement"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={loading}
									className="flex-1">
									Cancel
								</Button>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
