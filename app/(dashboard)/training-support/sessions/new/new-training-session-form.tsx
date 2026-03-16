"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompetencyLevel, DeliveryMethod } from "@/generated/prisma/enums";
import { createTrainingSession } from "@/lib/features/training/actions/training-session.actions";

// Define enums locally to avoid importing from Prisma

const sessionFormSchema = z.object({
	trainingEngagementId: z.string().min(1, "Training engagement is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	sessionNumber: z.number().min(1, "Session number must be at least 1"),
	deliveryMethod: z.string().min(1, "Delivery method is required"),
	duration: z.number().min(1, "Duration must be at least 1 minute"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	maxCapacity: z.number().optional(),
	instructorId: z.string().optional(),
	contentUrl: z.string().optional(),
	location: z.string().optional(),
	hasPreAssessment: z.boolean(),
	hasPostAssessment: z.boolean(),
	preRequisiteLevel: z.string().optional(),
	sopLibraryIds: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionFormSchema>;

interface NewTrainingSessionFormProps {
	trainingEngagementOptions: Array<{ value: string; label: string }>;
}

export function NewTrainingSessionForm({ trainingEngagementOptions }: NewTrainingSessionFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<SessionFormData>({
		resolver: zodResolver(sessionFormSchema),
		defaultValues: {
			trainingEngagementId: "",
			title: "",
			description: "",
			sessionNumber: 1,
			deliveryMethod: "",
			duration: 60,
			startDate: "",
			endDate: "",
			maxCapacity: undefined,
			instructorId: "",
			contentUrl: "",
			location: "",
			hasPreAssessment: false,
			hasPostAssessment: false,
			preRequisiteLevel: "",
			sopLibraryIds: "",
		},
	});

	async function onSubmit(data: SessionFormData) {
		try {
			setIsSubmitting(true);

			const sessionData = {
				...data,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
				deliveryMethod: data.deliveryMethod as DeliveryMethod,
				preRequisiteLevel: data.preRequisiteLevel ? (data.preRequisiteLevel as CompetencyLevel) : undefined,
			};

			const result = await createTrainingSession(sessionData);

			if (result.success) {
				toast.success("Training session created successfully");
				router.push("/training-support/sessions");
			} else {
				toast.error(result.message || "Failed to create training session");
			}
		} catch (error) {
			console.error("Error creating training session:", error);
			toast.error("An error occurred while creating the training session");
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleCancel() {
		router.push("/training-support/sessions");
	}

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create New Training Session</h1>
					<p className="text-muted-foreground">Create a new training session with details and scheduling</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="submit"
						form="training-session-form"
						disabled={isSubmitting}>
						{isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
						{isSubmitting ? "Creating..." : "Create Session"}
					</Button>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle>Session Details</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							id="training-session-form"
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6">
							<FormField
								control={form.control}
								name="trainingEngagementId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Training Engagement</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select training engagement" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{trainingEngagementOptions?.map((option) => (
													<SelectItem
														key={option.value}
														value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

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
													placeholder="Session title"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="sessionNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Session Number</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="1"
													onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
												placeholder="Session description..."
												rows={3}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="deliveryMethod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Delivery Method</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select delivery method" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="IN_PERSON">In Person</SelectItem>
													<SelectItem value="VIRTUAL">Virtual</SelectItem>
													<SelectItem value="HYBRID">Hybrid</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="duration"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Duration (minutes)</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="60"
													onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
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
											<FormLabel>Start Date & Time</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="datetime-local"
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
											<FormLabel>End Date & Time</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="datetime-local"
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
									name="maxCapacity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Max Capacity</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="20"
													onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<Input
													{...field}
													placeholder="Room 101 or Zoom link"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="contentUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content URL</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="https://example.com/content"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-4">
								<label className="text-sm font-medium">Assessments</label>
								<div className="flex gap-6">
									<FormField
										control={form.control}
										name="hasPreAssessment"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-y-0 space-x-3">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Pre-assessment</FormLabel>
												</div>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="hasPostAssessment"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-y-0 space-x-3">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Post-assessment</FormLabel>
												</div>
											</FormItem>
										)}
									/>
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
