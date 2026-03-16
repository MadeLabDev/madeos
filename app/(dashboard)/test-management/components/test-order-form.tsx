"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TestOrderStatus } from "@/generated/prisma/enums";
import { PRIORITY_LEVELS } from "@/lib/config/module-types";
import { ENGAGEMENT_STATUSES } from "@/lib/config/module-types";
import { type PriorityLevel } from "@/lib/config/module-types";
import { getEngagementsAction } from "@/lib/features/customers/actions";
import { createTestOrder, getTestOrderById, updateTestOrder } from "@/lib/features/testing/actions";
import { searchEngagements, searchUsers } from "@/lib/features/testing/actions/search.actions";
import { getUsersAction } from "@/lib/features/users/actions";
import { cn } from "@/lib/utils";

const testOrderSchema = z.object({
	engagementId: z.string().min(1, "Engagement is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	status: z.nativeEnum(TestOrderStatus as any),
	priority: z.enum(PRIORITY_LEVELS.map((p) => p.value) as [PriorityLevel, ...PriorityLevel[]]),
	requestedBy: z.string().min(1, "Requested by is required"),
	assignedTo: z.string().optional(),
	contactId: z.string().optional(),
	startDate: z.date().optional(),
	dueDate: z.date().optional(),
	budget: z.number().optional(),
	notes: z.string().optional(),
});

type TestOrderFormData = z.infer<typeof testOrderSchema>;

interface TestOrderFormProps {
	testOrderId?: string;
	hideButtons?: boolean;
	hideHeader?: boolean;
}

export function TestOrderForm({ testOrderId, hideButtons = false, hideHeader = false }: TestOrderFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [engagements, setEngagements] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [contacts, setContacts] = useState<any[]>([]);

	// Wrapper functions for AsyncSearchSelect
	const fetchEngagements = async (query: string) => {
		const result = await searchEngagements(query);
		return result.success ? result.data : [];
	};

	const fetchUsers = async (query: string) => {
		const result = await searchUsers(query);
		return result.success ? result.data : [];
	};

	const form = useForm<TestOrderFormData>({
		resolver: zodResolver(testOrderSchema),
		defaultValues: {
			engagementId: "",
			title: "",
			description: "",
			priority: "MEDIUM",
			requestedBy: "",
			assignedTo: "unassigned",
			contactId: "",
			startDate: undefined,
			dueDate: undefined,
			budget: undefined,
			notes: "",
		},
	});

	const watchedEngagementId = useWatch({
		control: form.control,
		name: "engagementId",
	});

	const loadData = async () => {
		try {
			// Load engagements
			const engagementsResult = await getEngagementsAction();
			if (engagementsResult.success && engagementsResult.data) {
				setEngagements((engagementsResult.data as any).engagements || []);
			}

			// Load users
			const usersResult = await getUsersAction({ pageSize: 100 }); // Load more users for selection
			if (usersResult.success && usersResult.data) {
				setUsers((usersResult.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load data:", error);
		}
	};
	const loadTestOrder = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getTestOrderById(testOrderId!);
			if (result.success && result.data) {
				// Wait for users and engagements to be loaded before resetting form
				await loadData();

				form.reset({
					engagementId: result.data.engagementId || "",
					title: result.data.title,
					description: result.data.description || "",
					status: result.data.status || "DRAFT",
					priority: (result.data.priority as PriorityLevel) || "MEDIUM",
					requestedBy: result.data.requestedBy || "",
					assignedTo: result.data.assignedTo || "unassigned",
					contactId: result.data.contactId || "",
					startDate: result.data.startDate ? new Date(result.data.startDate) : undefined,
					dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
					budget: result.data.budget || undefined,
					notes: result.data.notes || "",
				});
			} else {
				toast.error("Failed to load test order");
				router.push("/testing");
			}
		} catch (error) {
			toast.error("Failed to load test order");
			router.push("/testing");
		} finally {
			setLoading(false);
		}
	}, [testOrderId, form, router]);

	useEffect(() => {
		if (testOrderId) {
			loadTestOrder();
		} else {
			loadData();
		}
	}, [testOrderId, loadTestOrder]);

	// Load contacts when engagement changes
	useEffect(() => {
		const loadContacts = async () => {
			if (watchedEngagementId) {
				try {
					const engagement = engagements.find((e) => e.id === watchedEngagementId);
					if (engagement?.customer?.contacts) {
						setContacts([...engagement.customer.contacts]);
					} else {
						// Load contacts for the customer of this engagement
						const customerContacts = engagements.find((e) => e.id === watchedEngagementId)?.customer?.contacts || [];
						setContacts([...customerContacts]);
					}
				} catch (error) {
					console.error("Failed to load contacts:", error);
					setContacts([]);
				}
			} else {
				setContacts([]);
			}
		};

		loadContacts();
	}, [watchedEngagementId, engagements]);

	const onSubmit = async (data: TestOrderFormData) => {
		try {
			setLoading(true);

			// Convert "unassigned" to null for assignedTo field
			const submitData = {
				...data,
				assignedTo: data.assignedTo === "unassigned" ? null : data.assignedTo,
				contactId: data.contactId || null,
			};

			if (testOrderId) {
				// Update existing test order
				const result = await updateTestOrder(testOrderId, submitData);
				if (result.success) {
					toast.success("Test order updated successfully");
					router.push(`/test-management/${testOrderId}`);
				} else {
					toast.error(result.message || "Failed to update test order");
				}
			} else {
				// Create new test order
				const result = await createTestOrder({
					...submitData,
					requestedBy: data.requestedBy || users[0]?.id,
				});

				if (result.success) {
					toast.success("Test order created successfully");
					router.push("/testing");
				} else {
					toast.error(result.message || "Failed to create test order");
				}
			}
		} catch (error) {
			toast.error("Failed to save test order");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			{!hideHeader && (
				<CardHeader>
					<CardTitle>{testOrderId ? "Edit Test Order" : "Create Test Order"}</CardTitle>
				</CardHeader>
			)}
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
						data-test-order-form>
						{/* Engagement Selection */}
						<FormField
							control={form.control}
							name="engagementId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Engagement *</FormLabel>
									<FormControl>
										<AsyncSearchSelect
											value={field.value}
											onValueChange={field.onChange}
											fetchOptions={fetchEngagements}
											placeholder="Search and select an engagement"
											searchPlaceholder="Search engagements..."
											emptyMessage="No engagements found."
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
								<FormItem>
									<FormLabel>Title *</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter test order title"
											{...field}
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
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter test order description"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Status */}
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status *</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}>
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

						{/* Priority and Requested By */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Priority</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
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

							<FormField
								control={form.control}
								name="requestedBy"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Requested By *</FormLabel>
										<FormControl>
											<AsyncSearchSelect
												value={field.value}
												onValueChange={field.onChange}
												fetchOptions={fetchUsers}
												placeholder="Search and select requester"
												searchPlaceholder="Search users..."
												emptyMessage="No users found."
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						{/* Assigned To */}
						<FormField
							control={form.control}
							name="assignedTo"
							render={({ field }) => (
								<FormItem>
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

						{/* Primary Contact */}
						<FormField
							control={form.control}
							name="contactId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Primary Contact</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value || ""}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select primary contact" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{contacts.map((contact) => (
												<SelectItem
													key={contact.id}
													value={contact.id}>
													{contact.firstName} {contact.lastName} - {contact.title} ({contact.email})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormItem>
							)}
						/>

						{/* Dates */}
						<div className="grid grid-cols-2 gap-4">
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
														variant="outline"
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
														variant="outline"
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
						</div>

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
											placeholder="Enter budget amount"
											{...field}
											onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
											value={field.value || ""}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter additional notes"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						{/* Submit Button */}
						{!hideButtons && (
							<div className="flex justify-end space-x-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}>
									<X className="mr-2 h-4 w-4" />
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									<Save className="mr-2 h-4 w-4" />
									{testOrderId ? "Update Test Order" : "Create Test Order"}
								</Button>
							</div>
						)}

						{hideButtons && (
							<div className="hidden">
								<Button
									type="submit"
									disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									<Save className="mr-2 h-4 w-4" />
									{testOrderId ? "Update Test Order" : "Create Test Order"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}>
									<X className="mr-2 h-4 w-4" />
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
