"use client";

import { useState } from "react";

import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentWithRelations } from "@/lib/features/assessments";
import { deleteAssessmentAction } from "@/lib/features/assessments";

import { AssessmentStatusBadge } from "./assessment-status-badge";
import { AssessmentTypeBadge } from "./assessment-type-badge";

interface AssessmentDetailProps {
	assessment: AssessmentWithRelations;
}

export function AssessmentDetail({ assessment }: AssessmentDetailProps) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteAssessmentAction(assessment.id);
			if (result.success) {
				toast.success("Assessment deleted successfully");
				router.push("/training-support/assessments");
				router.refresh();
			} else {
				toast.error(result.message || "Failed to delete assessment");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the assessment");
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	return (
		<>
			<div className="space-y-6">
				{/* Header with actions */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex-1 space-y-1">
						<div className="flex items-center gap-2">
							<h1 className="text-3xl font-bold tracking-tight">{assessment.title}</h1>
							<div className="flex gap-2">
								<AssessmentStatusBadge status={assessment.status} />
								<AssessmentTypeBadge type={assessment.assessmentType} />
							</div>
						</div>
						<p className="text-muted-foreground">{assessment.description || "No description provided"}</p>
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<Button asChild>
							<Link href={`/training-support/assessments/${assessment.id}/edit`}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</Button>
						<Button
							variant="destructive"
							onClick={() => setShowDeleteDialog(true)}
							disabled={isDeleting}>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</div>

				{/* Details Card */}
				<Card>
					<CardHeader>
						<CardTitle>Assessment Details</CardTitle>
						<CardDescription>Core information about this assessment</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Administration Timing */}
							<div>
								<h3 className="text-muted-foreground text-sm font-medium">Administration Timing</h3>
								<p className="mt-1 text-lg font-semibold">{assessment.administrationTiming || "Unknown"}</p>
							</div>

							{/* Assessment Type */}
							<div>
								<h3 className="text-muted-foreground text-sm font-medium">Assessment Type</h3>
								<p className="mt-1 text-lg font-semibold">{assessment.assessmentType || "Unknown"}</p>
							</div>

							{/* Due Date */}
							{assessment.dueDate && (
								<div>
									<div className="flex items-center gap-2">
										<Calendar className="text-muted-foreground h-4 w-4" />
										<h3 className="text-muted-foreground text-sm font-medium">Due Date</h3>
									</div>
									<p className="mt-1 text-lg font-semibold">{new Date(assessment.dueDate).toLocaleDateString()}</p>
								</div>
							)}

							{/* Passing Score */}
							{assessment.passingScore !== undefined && (
								<div>
									<div className="flex items-center gap-2">
										<CheckCircle className="text-muted-foreground h-4 w-4" />
										<h3 className="text-muted-foreground text-sm font-medium">Passing Score</h3>
									</div>
									<p className="mt-1 text-lg font-semibold">{assessment.passingScore}%</p>
								</div>
							)}

							{/* Score */}
							{assessment.score !== undefined && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Score</h3>
									<p className="mt-1 text-lg font-semibold">{assessment.score}%</p>
								</div>
							)}

							{/* Training Engagement */}
							{assessment.trainingEngagement && (
								<div>
									<div className="flex items-center gap-2">
										<Clock className="text-muted-foreground h-4 w-4" />
										<h3 className="text-muted-foreground text-sm font-medium">Training Engagement</h3>
									</div>
									<Link
										href={`/training-support/${assessment.trainingEngagement.id}`}
										className="mt-1 text-lg font-semibold text-blue-600 hover:underline">
										{assessment.trainingEngagement.title}
									</Link>
								</div>
							)}

							{/* Training Session */}
							{assessment.trainingSession && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Training Session</h3>
									<p className="mt-1 text-lg font-semibold">{assessment.trainingSession.title}</p>
								</div>
							)}

							{/* Competency Level */}
							{assessment.competencyLevel && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Competency Level</h3>
									<p className="mt-1 text-lg font-semibold">{assessment.competencyLevel}</p>
								</div>
							)}

							{/* Taken At */}
							{assessment.takenAt && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Taken At</h3>
									<p className="mt-1 text-lg font-semibold">{new Date(assessment.takenAt).toLocaleString()}</p>
								</div>
							)}
						</div>

						{/* Feedback Section */}
						{assessment.feedback && (
							<div className="border-t pt-4">
								<h3 className="text-muted-foreground mb-2 text-sm font-medium">Feedback</h3>
								<div className="bg-muted rounded-md p-4">
									<p className="text-sm whitespace-pre-wrap">{assessment.feedback}</p>
								</div>
							</div>
						)}

						{/* Questions Section */}
						{assessment.questions && (
							<div className="border-t pt-4">
								<h3 className="text-muted-foreground mb-2 text-sm font-medium">Questions</h3>
								<div className="bg-muted rounded-md p-4">
									<p className="text-sm whitespace-pre-wrap">{assessment.questions}</p>
								</div>
							</div>
						)}

						{/* Created/Updated Info */}
						<div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
							<p>Created: {new Date(assessment.createdAt).toLocaleString()}</p>
							<p>Last Updated: {new Date(assessment.updatedAt).toLocaleString()}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Assessment</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{assessment.title}"? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex justify-end gap-3">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
