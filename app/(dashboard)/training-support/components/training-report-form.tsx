"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CompetencyLevel, ReportType } from "@/generated/prisma/enums";
import { createTrainingReportAction } from "@/lib/features/training/actions/training-report.actions";

const trainingReportSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	reportType: z.nativeEnum(ReportType).optional(),
	totalParticipants: z.number().min(0).optional(),
	totalAttended: z.number().min(0).optional(),
	completionRate: z.number().min(0).max(1).optional(),
	averageScore: z.number().min(0).max(100).optional(),
	overallCompetency: z.nativeEnum(CompetencyLevel).optional(),
	passedCount: z.number().min(0).optional(),
	failedCount: z.number().min(0).optional(),
	averageAttendance: z.number().min(0).max(100).optional(),
	certificationsIssued: z.number().min(0).optional(),
	certificationTemplate: z.string().optional(),
	keyFindings: z.string().optional(),
	recommendations: z.string().optional(),
});

type TrainingReportFormData = z.infer<typeof trainingReportSchema>;

interface TrainingReportFormProps {
	engagementId: string;
}

export function TrainingReportForm({ engagementId }: TrainingReportFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const form = useForm<TrainingReportFormData>({
		resolver: zodResolver(trainingReportSchema),
		defaultValues: {
			title: "",
			description: "",
			reportType: ReportType.COMPLETION,
			totalParticipants: 0,
			totalAttended: 0,
			completionRate: 0,
			averageScore: 0,
			passedCount: 0,
			failedCount: 0,
			averageAttendance: 0,
			certificationsIssued: 0,
			certificationTemplate: "",
			keyFindings: "",
			recommendations: "",
		},
	});

	const onSubmit = async (data: TrainingReportFormData) => {
		setLoading(true);
		try {
			const result = await createTrainingReportAction({
				trainingEngagementId: engagementId,
				...data,
			});

			if (result.success) {
				toast.success("Training report created successfully");
				router.push(`/training-support/${engagementId}/reports`);
			} else {
				toast.error(result.message || "Failed to create training report");
			}
		} catch (error) {
			toast.error("Failed to create training report");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Report Details</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Report Title</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g., Q4 Training Completion Report"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="reportType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Report Type</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select report type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={ReportType.COMPLETION}>Completion Report</SelectItem>
												<SelectItem value={ReportType.COMPETENCY}>Competency Assessment</SelectItem>
												<SelectItem value={ReportType.CERTIFICATION}>Certification Report</SelectItem>
											</SelectContent>
										</Select>
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
											placeholder="Brief description of this training report..."
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<FormField
								control={form.control}
								name="totalParticipants"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Participants</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
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
								name="totalAttended"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Attended</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
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
								name="completionRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Completion Rate (%)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="100"
												step="0.1"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
												value={field.value ? (field.value * 100).toFixed(1) : ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<FormField
								control={form.control}
								name="averageScore"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Average Score</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="100"
												step="0.1"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="overallCompetency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Overall Competency</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select competency level" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={CompetencyLevel.NOVICE}>Novice</SelectItem>
												<SelectItem value={CompetencyLevel.BEGINNER}>Beginner</SelectItem>
												<SelectItem value={CompetencyLevel.INTERMEDIATE}>Intermediate</SelectItem>
												<SelectItem value={CompetencyLevel.ADVANCED}>Advanced</SelectItem>
												<SelectItem value={CompetencyLevel.EXPERT}>Expert</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="averageAttendance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Average Attendance (%)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												max="100"
												step="0.1"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							<FormField
								control={form.control}
								name="passedCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Passed Count</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
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
								name="failedCount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Failed Count</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
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
								name="certificationsIssued"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Certifications Issued</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="certificationTemplate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Certification Template</FormLabel>
									<FormControl>
										<Input
											placeholder="Template reference or name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="keyFindings"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Key Findings</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Summarize the key findings from this training..."
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="recommendations"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Recommendations</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Provide recommendations for future training sessions..."
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
								disabled={loading}>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading}>
								{loading ? "Creating..." : "Create Report"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
