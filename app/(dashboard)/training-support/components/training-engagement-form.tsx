"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AsyncSearchSelect, type SearchSelectOption } from "@/components/ui/async-search-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CertificationLevel, DeliveryMethod, TrainingType } from "@/generated/prisma/enums";
import { getContactsAction } from "@/lib/features/contacts/actions";
import { searchCustomers } from "@/lib/features/design/actions/search.actions";
import { createTrainingEngagement, getTrainingEngagementById, updateTrainingEngagement } from "@/lib/features/training/actions";
import { CreateTrainingEngagementFormInput, UpdateTrainingEngagementInput } from "@/lib/features/training/types";
import { getUserByIdAction, searchUsersAction } from "@/lib/features/users/actions";
import { cn } from "@/lib/utils";

const trainingEngagementSchema = z.object({
	engagementId: z.string().optional(),
	customerId: z.string().min(1, "Customer is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	trainingType: z.nativeEnum(TrainingType).optional(),
	deliveryMethod: z.nativeEnum(DeliveryMethod).optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	totalDurationHours: z.number().min(0).optional(),
	targetAudience: z.string().optional(),
	maxParticipants: z.number().min(1).optional(),
	minParticipants: z.number().min(0).optional(),
	certificationLevel: z.nativeEnum(CertificationLevel).optional(),
	requestedBy: z.string().min(1, "Requested by is required"),
	requestedByUserId: z.string().optional(),
	instructorId: z.string().optional(),
	coordinatorId: z.string().optional(),
	contactId: z.string().optional(),
});

type TrainingEngagementFormData = z.infer<typeof trainingEngagementSchema>;

interface TrainingEngagementFormProps {
	engagementId?: string;
	hideButtons?: boolean;
}

export function TrainingEngagementForm({ engagementId, hideButtons }: TrainingEngagementFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(!!engagementId);
	const [contacts, setContacts] = useState<any[]>([]);
	const [initialCustomer, setInitialCustomer] = useState<SearchSelectOption | null>(null);
	const [initialInstructor, setInitialInstructor] = useState<SearchSelectOption | null>(null);
	const [initialCoordinator, setInitialCoordinator] = useState<SearchSelectOption | null>(null);
	const [initialRequestedBy, setInitialRequestedBy] = useState<SearchSelectOption | null>(null);

	const [formData, setFormData] = useState<Partial<TrainingEngagementFormData>>({
		trainingType: TrainingType.INSTRUCTOR_LED,
		deliveryMethod: DeliveryMethod.HYBRID,
		certificationLevel: CertificationLevel.NONE,
	});

	const form = useForm<TrainingEngagementFormData>({
		resolver: zodResolver(trainingEngagementSchema),
		defaultValues: formData,
	});

	// Wrapper functions for AsyncSearchSelect
	const fetchCustomersOptions = useCallback(async (query: string) => {
		const result = await searchCustomers(query);
		return result.success ? result.data : [];
	}, []);

	// Memoized fetch functions to prevent infinite loops
	const fetchUsersOptions = useCallback(async (query: string) => {
		const result = await searchUsersAction(query);
		if (result.success && result.data) {
			const data = result.data as { users: any[] };
			return data.users.map((user: any) => ({
				value: user.id,
				label: user.name || user.email,
				description: user.email,
			}));
		}
		return [];
	}, []);

	// Load data on mount
	useEffect(() => {
		const loadData = async () => {
			try {
				const contactsResult = await getContactsAction({ pageSize: 100 });

				if (contactsResult.success) setContacts((contactsResult.data as any).contacts || []);

				// Load existing engagement data if editing
				if (engagementId) {
					setIsLoading(true);
					const engagementResult = await getTrainingEngagementById(engagementId);
					if (engagementResult.success && engagementResult.data) {
						const engagement = engagementResult.data;

						// Set initial customer option for AsyncSearchSelect
						if (engagement.customer) {
							setInitialCustomer({
								value: engagement.customer.id,
								label: engagement.customer.companyName,
								description: engagement.customer.email,
							});
						}

						// Fetch user details for instructor, coordinator, and requested by
						const userPromises = [];
						if (engagement.instructorId) {
							userPromises.push(getUserByIdAction(engagement.instructorId));
						}
						if (engagement.coordinatorId) {
							userPromises.push(getUserByIdAction(engagement.coordinatorId));
						}
						if (engagement.requestedByUserId) {
							userPromises.push(getUserByIdAction(engagement.requestedByUserId));
						}

						const userResults = await Promise.all(userPromises);

						// Set initial options for AsyncSearchSelect components
						let instructorIndex = 0;
						let coordinatorIndex = engagement.instructorId ? 1 : 0;
						let requestedByIndex = (engagement.instructorId ? 1 : 0) + (engagement.coordinatorId ? 1 : 0);

						if (engagement.instructorId && userResults[instructorIndex]?.success) {
							const user = userResults[instructorIndex].data as any;
							setInitialInstructor({
								value: user.id,
								label: user.name || user.email,
								description: user.email,
							});
						}

						if (engagement.coordinatorId && userResults[coordinatorIndex]?.success) {
							const user = userResults[coordinatorIndex].data as any;
							setInitialCoordinator({
								value: user.id,
								label: user.name || user.email,
								description: user.email,
							});
						}

						if (engagement.requestedByUserId && userResults[requestedByIndex]?.success) {
							const user = userResults[requestedByIndex].data as any;
							setInitialRequestedBy({
								value: user.id,
								label: user.name || user.email,
								description: user.email,
							});
						}

						const newFormData: TrainingEngagementFormData = {
							engagementId: engagement.engagementId.toString(),
							customerId: engagement.customerId,
							title: engagement.title,
							description: engagement.description || "",
							trainingType: engagement.trainingType || TrainingType.INSTRUCTOR_LED,
							deliveryMethod: engagement.deliveryMethod || DeliveryMethod.HYBRID,
							startDate: engagement.startDate ? new Date(engagement.startDate) : undefined,
							endDate: engagement.endDate ? new Date(engagement.endDate) : undefined,
							totalDurationHours: engagement.totalDurationHours ?? undefined,
							targetAudience: engagement.targetAudience || "",
							maxParticipants: engagement.maxParticipants ?? undefined,
							minParticipants: engagement.minParticipants ?? undefined,
							certificationLevel: engagement.certificationLevel || CertificationLevel.NONE,
							requestedBy: engagement.requestedBy,
							requestedByUserId: engagement.requestedByUserId || "",
							instructorId: engagement.instructorId || "",
							coordinatorId: engagement.coordinatorId || "",
							contactId: engagement.contactId || "",
						};

						setFormData(newFormData);
						form.reset(newFormData);
					}
				}
			} catch (error) {
				console.error("Failed to load form data:", error);
				toast.error("Failed to load form data");
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, [engagementId, form]);

	// Reset form when formData changes
	useEffect(() => {
		if (Object.keys(formData).length > 0) {
			form.reset(formData);
		}
	}, [formData, form]);

	const onSubmit = async (data: TrainingEngagementFormData) => {
		setIsSubmitting(true);
		try {
			if (engagementId) {
				// Update existing engagement
				const input: UpdateTrainingEngagementInput = {
					...data,
					startDate: data.startDate,
					endDate: data.endDate,
				};

				const result = await updateTrainingEngagement(engagementId, input);

				if (result.success) {
					toast.success("Training engagement updated successfully");
					router.push(`/training-support/${engagementId}`);
				} else {
					toast.error(result.message || "Failed to update training engagement");
				}
			} else {
				// Create new engagement
				const input: CreateTrainingEngagementFormInput = {
					...data,
					startDate: data.startDate,
					endDate: data.endDate,
				};

				const result = await createTrainingEngagement(input);

				if (result.success) {
					toast.success("Training engagement created successfully");
					router.push(`/training-support/${result.data?.id}`);
				} else {
					toast.error(result.message || "Failed to create training engagement");
				}
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return <Loader size="lg" />;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Training Engagement Details</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						data-training-form
						className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Basic Information */}
							<div className="md:col-span-2">
								<h3 className="mb-4 text-lg font-medium">Basic Information</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title *</FormLabel>
												<FormControl>
													<Input
														placeholder="Training Program Title"
														{...field}
													/>
												</FormControl>
												<FormMessage />
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
														fetchOptions={fetchCustomersOptions}
														initialOptions={initialCustomer ? [initialCustomer] : []}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="mt-6">
									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder="Describe the training program objectives and scope"
														className="min-h-[100px]"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Training Configuration */}
							<div className="md:col-span-2">
								<h3 className="mb-4 text-lg font-medium">Training Configuration</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="trainingType"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Training Type</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select training type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value={TrainingType.INSTRUCTOR_LED}>Instructor Led</SelectItem>
														<SelectItem value={TrainingType.SELF_PACED}>Self Paced</SelectItem>
														<SelectItem value={TrainingType.BLENDED}>Blended</SelectItem>
														<SelectItem value={TrainingType.WORKSHOP}>Workshop</SelectItem>
														<SelectItem value={TrainingType.MENTORING}>Mentoring</SelectItem>
														<SelectItem value={TrainingType.CERTIFICATION_PREP}>Certification Prep</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="deliveryMethod"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Delivery Method</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select delivery method" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value={DeliveryMethod.IN_PERSON}>In Person</SelectItem>
														<SelectItem value={DeliveryMethod.ONLINE}>Online</SelectItem>
														<SelectItem value={DeliveryMethod.HYBRID}>Hybrid</SelectItem>
														<SelectItem value={DeliveryMethod.ASYNCHRONOUS}>Asynchronous</SelectItem>
														<SelectItem value={DeliveryMethod.RECORDED}>Recorded</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="certificationLevel"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Certification Level</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select certification level" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value={CertificationLevel.NONE}>None</SelectItem>
														<SelectItem value={CertificationLevel.COMPLETION}>Completion</SelectItem>
														<SelectItem value={CertificationLevel.COMPETENCY}>Competency</SelectItem>
														<SelectItem value={CertificationLevel.EXTERNAL_ALIGNED}>External Aligned</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Schedule & Duration */}
							<div className="md:col-span-2">
								<h3 className="mb-4 text-lg font-medium">Schedule & Duration</h3>
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
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="endDate"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>End Date</FormLabel>
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
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="totalDurationHours"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Total Duration (Hours)</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="0"
														step="0.5"
														placeholder="40"
														{...field}
														onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Participants & Team */}
							<div className="md:col-span-2">
								<h3 className="mb-4 text-lg font-medium">Participants & Team</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="targetAudience"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Target Audience</FormLabel>
												<FormControl>
													<Input
														placeholder="e.g., Production Team, Managers"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="maxParticipants"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Max Participants</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="1"
														placeholder="20"
														{...field}
														onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="minParticipants"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Min Participants</FormLabel>
												<FormControl>
													<Input
														type="number"
														min="0"
														placeholder="5"
														{...field}
														onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="instructorId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Instructor</FormLabel>
												<FormControl>
													<AsyncSearchSelect
														value={field.value}
														onValueChange={field.onChange}
														fetchOptions={fetchUsersOptions}
														placeholder="Search instructor..."
														searchPlaceholder="Search by name or email..."
														emptyMessage="No instructors found"
														initialOptions={initialInstructor ? [initialInstructor] : []}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="coordinatorId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Coordinator</FormLabel>
												<FormControl>
													<AsyncSearchSelect
														value={field.value}
														onValueChange={field.onChange}
														fetchOptions={fetchUsersOptions}
														placeholder="Search coordinator..."
														searchPlaceholder="Search by name or email..."
														emptyMessage="No coordinators found"
														initialOptions={initialCoordinator ? [initialCoordinator] : []}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="contactId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Primary Contact</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select contact" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{contacts.map((contact) => (
															<SelectItem
																key={contact.id}
																value={contact.id}>
																{contact.firstName} {contact.lastName}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							{/* Request Information */}
							<div className="md:col-span-2">
								<h3 className="mb-4 text-lg font-medium">Request Information</h3>
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="requestedByUserId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Requested By *</FormLabel>
												<FormControl>
													<AsyncSearchSelect
														value={field.value}
														onValueChange={(value) => {
															field.onChange(value);
															// Update the requestedBy field with user name
															if (value) {
																// The user name will be set via the display label
																form.setValue("requestedBy", value);
															}
														}}
														fetchOptions={fetchUsersOptions}
														placeholder="Search user or department..."
														searchPlaceholder="Search by name or email..."
														emptyMessage="No users found"
														initialOptions={initialRequestedBy ? [initialRequestedBy] : []}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>

						{!hideButtons && (
							<div className="flex justify-end gap-4 border-t pt-6">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={isSubmitting}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}>
									{isSubmitting ? (engagementId ? "Updating..." : "Creating...") : engagementId ? "Update Training Engagement" : "Create Training Engagement"}
								</Button>
							</div>
						)}

						{/* Hidden buttons for wrapper to trigger */}
						{hideButtons && (
							<div className="hidden">
								<Button
									type="button"
									variant="outline"
									onClick={() => router.back()}
									disabled={isSubmitting}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}>
									{isSubmitting ? (engagementId ? "Updating..." : "Creating...") : engagementId ? "Update Training Engagement" : "Create Training Engagement"}
								</Button>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
