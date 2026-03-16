"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AssessmentWithRelations, CreateAssessmentInput } from "@/lib/features/assessments";
import { createAssessmentAction, updateAssessmentAction } from "@/lib/features/assessments";
import { getTrainingEngagements } from "@/lib/features/training/actions/training-engagement.actions";

// Zod validation schema
const assessmentFormSchema = z.object({
	title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
	description: z.string().optional(),
	assessmentType: z.enum(["QUIZ", "PRACTICAL", "CERTIFICATION", "SURVEY", "SELF_ASSESSMENT"]),
	administrationTiming: z.enum(["PRE", "MID", "POST"]),
	trainingEngagementId: z.string().min(1, "Training engagement is required"),
	trainingSessionId: z.string().optional(),
	dueDate: z.coerce.date().optional(),
	passingScore: z.coerce.number().min(0).max(100).optional(),
	questions: z.string().optional(),
	status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "PASSED"]),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
	initialData?: AssessmentWithRelations;
	isEditing?: boolean;
	hideButtons?: boolean;
	onSubmittingChange?: (isSubmitting: boolean) => void;
}

export function AssessmentForm({ initialData, isEditing = false, hideButtons = false, onSubmittingChange }: AssessmentFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateSubmittingState = (submitting: boolean) => {
		setIsSubmitting(submitting);
		onSubmittingChange?.(submitting);
	};
	const [trainingEngagements, setTrainingEngagements] = useState<any[]>([]);

	// Load training engagements
	useEffect(() => {
		const loadTrainingEngagements = async () => {
			const result = await getTrainingEngagements();
			if (result.success && result.data) {
				setTrainingEngagements(result.data);
			}
		};
		loadTrainingEngagements();
	}, []);

	const form = useForm<AssessmentFormValues>({
		resolver: zodResolver(assessmentFormSchema) as any,
		defaultValues: initialData
			? ({
					title: initialData.title,
					description: initialData.description || "",
					assessmentType: initialData.assessmentType,
					administrationTiming: initialData.administrationTiming,
					trainingEngagementId: initialData.trainingEngagementId,
					trainingSessionId: initialData.trainingSessionId || "",
					dueDate: initialData.dueDate || undefined,
					passingScore: initialData.passingScore || undefined,
					questions: initialData.questions || "",
					status: initialData.status,
				} as AssessmentFormValues)
			: ({
					assessmentType: "QUIZ",
					administrationTiming: "POST",
					status: "PENDING",
				} as AssessmentFormValues),
	});

	async function onSubmit(values: AssessmentFormValues) {
		updateSubmittingState(true);
		try {
			const data: CreateAssessmentInput = {
				title: values.title,
				description: values.description,
				assessmentType: values.assessmentType,
				administrationTiming: values.administrationTiming,
				trainingEngagementId: values.trainingEngagementId,
				trainingSessionId: values.trainingSessionId,
				dueDate: values.dueDate,
				passingScore: values.passingScore,
				questions: values.questions,
				status: values.status,
			};

			const result = isEditing && initialData ? await updateAssessmentAction(initialData.id, data) : await createAssessmentAction(data);

			if (result.success) {
				toast.success(result.message || (isEditing ? "Assessment updated successfully" : "Assessment created successfully"));
				router.push("/training-support/assessments");
				router.refresh();
			} else {
				toast.error(result.message || "Failed to save assessment");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("An error occurred while saving the assessment");
		} finally {
			updateSubmittingState(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{isEditing ? "Edit Assessment" : "Create New Assessment"}</CardTitle>
				<CardDescription>{isEditing ? "Update the assessment details below" : "Fill in the assessment information to create a new assessment"}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						data-assessment-form
						className="space-y-6">
						{/* Title */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title *</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Safety Compliance Assessment"
											{...field}
										/>
									</FormControl>
									<FormMessage />
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
											placeholder="Assessment description and objectives"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Assessment Type */}
						<FormField
							control={form.control}
							name="assessmentType"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Assessment Type *</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="QUIZ">Quiz</SelectItem>
											<SelectItem value="PRACTICAL">Practical</SelectItem>
											<SelectItem value="CERTIFICATION">Certification</SelectItem>
											<SelectItem value="SURVEY">Survey</SelectItem>
											<SelectItem value="SELF_ASSESSMENT">Self Assessment</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Administration Timing */}
						<FormField
							control={form.control}
							name="administrationTiming"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Administration Timing *</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="PRE">Pre-Training</SelectItem>
											<SelectItem value="MID">Mid-Training</SelectItem>
											<SelectItem value="POST">Post-Training</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Training Engagement ID */}
						<FormField
							control={form.control}
							name="trainingEngagementId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Training Engagement *</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a training engagement" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{trainingEngagements.map((engagement) => (
												<SelectItem
													key={engagement.id}
													value={engagement.id}>
													{engagement.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>The training engagement this assessment belongs to</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Training Session ID (Optional) */}
						<FormField
							control={form.control}
							name="trainingSessionId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Training Session (Optional)</FormLabel>
									<FormControl>
										<Input
											placeholder="Training session ID (optional)"
											{...field}
										/>
									</FormControl>
									<FormMessage />
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
									<FormControl>
										<Input
											type="date"
											{...field}
											value={field.value ? field.value.toISOString().split("T")[0] : ""}
											onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Passing Score */}
						<FormField
							control={form.control}
							name="passingScore"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Passing Score (%)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="70"
											min="0"
											max="100"
											{...field}
										/>
									</FormControl>
									<FormDescription>Required percentage score to pass (0-100)</FormDescription>
									<FormMessage />
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
										value={field.value}
										onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="PENDING">Pending</SelectItem>
											<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
											<SelectItem value="COMPLETED">Completed</SelectItem>
											<SelectItem value="FAILED">Failed</SelectItem>
											<SelectItem value="PASSED">Passed</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Questions */}
						<FormField
							control={form.control}
							name="questions"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Questions</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Assessment questions (can be JSON formatted)"
											{...field}
										/>
									</FormControl>
									<FormDescription>Store questions in JSON format for structured assessments</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!hideButtons && (
							<>
								{/* Submit Button */}
								<div className="flex gap-4">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full sm:w-auto">
										{isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
										{isEditing ? "Update Assessment" : "Create Assessment"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										disabled={isSubmitting}>
										Cancel
									</Button>
								</div>
							</>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
