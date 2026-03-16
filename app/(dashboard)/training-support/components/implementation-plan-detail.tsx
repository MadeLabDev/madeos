"use client";

import { useCallback, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Edit, Plus, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createImplementationPlan, getImplementationPlanById, updateImplementationPlan } from "@/lib/features/training/actions/implementation-plan.actions";

// Define enums locally
enum PlanStatus {
	DRAFT = "DRAFT",
	ACTIVE = "ACTIVE",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

type ImplementationPlanWithRelations = any;

const implementationPlanFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	estimatedDurationDays: z.number().optional(),
	goals: z.string().optional(),
	successCriteria: z.string().optional(),
	applicableDepartments: z.string().optional(),
	applicableRoles: z.string().optional(),
	ownerUserId: z.string().optional(),
	supportContactId: z.string().optional(),
});

interface ImplementationPlanFormData {
	title: string;
	description?: string;
	startDate: string;
	endDate: string;
	estimatedDurationDays?: number;
	goals?: string;
	successCriteria?: string;
	applicableDepartments?: string;
	applicableRoles?: string;
	ownerUserId?: string;
	supportContactId?: string;
}

interface ImplementationPlanDetailProps {
	engagementId: string;
}

export function ImplementationPlanDetail({ engagementId }: ImplementationPlanDetailProps) {
	const [plan, setPlan] = useState<ImplementationPlanWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<ImplementationPlanFormData>({
		resolver: zodResolver(implementationPlanFormSchema),
		defaultValues: {
			title: "",
			description: "",
			startDate: "",
			endDate: "",
			estimatedDurationDays: undefined,
			goals: "",
			successCriteria: "",
			applicableDepartments: "",
			applicableRoles: "",
			ownerUserId: "",
			supportContactId: "",
		},
	});

	const loadImplementationPlan = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getImplementationPlanById(engagementId);
			if (result.success && result.data) {
				setPlan(result.data);
			}
		} catch (error) {
			console.error("Failed to load implementation plan:", error);
		} finally {
			setLoading(false);
		}
	}, [engagementId]);

	useEffect(() => {
		loadImplementationPlan();
	}, [engagementId, loadImplementationPlan]);

	const handleCreateOrUpdate = async (data: ImplementationPlanFormData) => {
		try {
			setIsSubmitting(true);

			const planData = {
				trainingEngagementId: engagementId,
				...data,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
			};

			let result;
			if (plan) {
				result = await updateImplementationPlan(plan.id, {
					id: plan.id,
					...planData,
				});
			} else {
				result = await createImplementationPlan(planData);
			}

			if (result.success) {
				toast.success(plan ? "Implementation plan updated successfully" : "Implementation plan created successfully");
				setDialogOpen(false);
				loadImplementationPlan();
				form.reset();
			} else {
				toast.error(result.message || "Failed to save implementation plan");
			}
		} catch (error) {
			toast.error("An error occurred while saving the implementation plan");
		} finally {
			setIsSubmitting(false);
		}
	};

	const openEditDialog = () => {
		if (plan) {
			form.reset({
				title: plan.title,
				description: plan.description || "",
				startDate: format(new Date(plan.startDate), "yyyy-MM-dd"),
				endDate: format(new Date(plan.endDate), "yyyy-MM-dd"),
				estimatedDurationDays: plan.estimatedDurationDays || undefined,
				goals: plan.goals || "",
				successCriteria: plan.successCriteria || "",
				applicableDepartments: plan.applicableDepartments || "",
				applicableRoles: plan.applicableRoles || "",
				ownerUserId: plan.ownerUserId || "",
				supportContactId: plan.supportContactId || "",
			});
		} else {
			form.reset({
				title: "",
				description: "",
				startDate: "",
				endDate: "",
				estimatedDurationDays: undefined,
				goals: "",
				successCriteria: "",
				applicableDepartments: "",
				applicableRoles: "",
				ownerUserId: "",
				supportContactId: "",
			});
		}
		setDialogOpen(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case PlanStatus.DRAFT:
				return "bg-gray-100 text-gray-800";
			case PlanStatus.ACTIVE:
				return "bg-blue-100 text-blue-800";
			case PlanStatus.IN_PROGRESS:
				return "bg-yellow-100 text-yellow-800";
			case PlanStatus.COMPLETED:
				return "bg-green-100 text-green-800";
			case PlanStatus.CANCELLED:
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader />
			</div>
		);
	}

	if (!plan) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold">Implementation Plan</h3>
						<p className="text-muted-foreground text-sm">Post-training support and follow-up tasks</p>
					</div>
					<Button
						onClick={openEditDialog}
						className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Create Implementation Plan
					</Button>
				</div>

				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
						<h4 className="mb-2 text-lg font-medium">No Implementation Plan</h4>
						<p className="text-muted-foreground mb-4 text-center text-sm">Create an implementation plan to track post-training support tasks and follow-up activities.</p>
						<Button
							onClick={openEditDialog}
							variant="outline">
							<Plus className="mr-2 h-4 w-4" />
							Create Plan
						</Button>
					</CardContent>
				</Card>

				{/* Create/Edit Dialog */}
				<Dialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Create Implementation Plan</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleCreateOrUpdate)}
								className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Implementation Plan Title"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="estimatedDurationDays"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Duration (Days)</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="number"
														placeholder="30"
														onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="startDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Start Date</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="date"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="endDate"
										render={({ field }) => (
											<FormItem>
												<FormLabel>End Date</FormLabel>
												<FormControl>
													<Input
														{...field}
														type="date"
													/>
												</FormControl>
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
													{...field}
													placeholder="Plan description..."
													rows={3}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="goals"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Goals</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder="Implementation goals..."
													rows={2}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="successCriteria"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Success Criteria</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													placeholder="How to measure success..."
													rows={2}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="applicableDepartments"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Applicable Departments</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., Engineering, Sales"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="applicableRoles"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Applicable Roles</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="e.g., Developer, Manager"
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex justify-end gap-2 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => setDialogOpen(false)}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}>
										{isSubmitting ? "Saving..." : "Save Plan"}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Implementation Plan</h3>
					<p className="text-muted-foreground text-sm">Post-training support and follow-up tasks</p>
				</div>
				<Button
					onClick={openEditDialog}
					variant="outline"
					className="flex items-center gap-2">
					<Edit className="h-4 w-4" />
					Edit Plan
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-medium">
							<CheckCircle className="h-4 w-4" />
							Progress
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>
									{plan.completedTasks} of {plan.totalTasks} tasks
								</span>
								<span>{plan.progressPercentage || 0}%</span>
							</div>
							<Progress
								value={plan.progressPercentage || 0}
								className="h-2"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-medium">
							<Calendar className="h-4 w-4" />
							Duration
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-1 text-sm">
							<div>Start: {format(new Date(plan.startDate), "MMM dd, yyyy")}</div>
							<div>End: {format(new Date(plan.endDate), "MMM dd, yyyy")}</div>
							{plan.estimatedDurationDays && <div className="text-muted-foreground">{plan.estimatedDurationDays} days estimated</div>}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-sm font-medium">
							<User className="h-4 w-4" />
							Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge className={getStatusColor(plan.status)}>{plan.status.replace("_", " ")}</Badge>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Plan Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label className="text-sm font-medium">Title</label>
						<p className="text-muted-foreground text-sm">{plan.title}</p>
					</div>

					{plan.description && (
						<div>
							<label className="text-sm font-medium">Description</label>
							<p className="text-muted-foreground text-sm">{plan.description}</p>
						</div>
					)}

					{plan.goals && (
						<div>
							<label className="text-sm font-medium">Goals</label>
							<p className="text-muted-foreground text-sm">{plan.goals}</p>
						</div>
					)}

					{plan.successCriteria && (
						<div>
							<label className="text-sm font-medium">Success Criteria</label>
							<p className="text-muted-foreground text-sm">{plan.successCriteria}</p>
						</div>
					)}

					{(plan.applicableDepartments || plan.applicableRoles) && (
						<div className="grid grid-cols-2 gap-4">
							{plan.applicableDepartments && (
								<div>
									<label className="text-sm font-medium">Applicable Departments</label>
									<p className="text-muted-foreground text-sm">{plan.applicableDepartments}</p>
								</div>
							)}
							{plan.applicableRoles && (
								<div>
									<label className="text-sm font-medium">Applicable Roles</label>
									<p className="text-muted-foreground text-sm">{plan.applicableRoles}</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Implementation Plan</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleCreateOrUpdate)}
							className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Implementation Plan Title"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="estimatedDurationDays"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (Days)</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="30"
													onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="date"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Date</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="date"
												/>
											</FormControl>
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
												{...field}
												placeholder="Plan description..."
												rows={3}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="goals"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Goals</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="Implementation goals..."
												rows={2}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="successCriteria"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Success Criteria</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="How to measure success..."
												rows={2}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="applicableDepartments"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Applicable Departments</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="e.g., Engineering, Sales"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="applicableRoles"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Applicable Roles</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="e.g., Developer, Manager"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setDialogOpen(false)}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
