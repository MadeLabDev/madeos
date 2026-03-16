"use client";

import { useState } from "react";

import { Calendar, CheckCircle, Clock, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentWithRelations } from "@/lib/features/assessments";
import { deleteAssessmentAction } from "@/lib/features/assessments";

import { AssessmentStatusBadge } from "./assessment-status-badge";
import { AssessmentTypeBadge } from "./assessment-type-badge";

interface AssessmentListItemProps {
	assessment: AssessmentWithRelations;
}

export function AssessmentListItem({ assessment }: AssessmentListItemProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteAssessmentAction(assessment.id);
			if (result.success) {
				toast.success("Assessment deleted successfully");
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
			<Card className="transition-shadow hover:shadow-md">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1 space-y-1">
							<Link
								href={`/training-support/assessments/${assessment.id}`}
								className="hover:underline">
								<CardTitle className="text-lg">{assessment.title}</CardTitle>
							</Link>
							<CardDescription className="line-clamp-2">{assessment.description || "No description provided"}</CardDescription>
						</div>
						<div className="flex gap-2">
							<AssessmentStatusBadge status={assessment.status} />
							<AssessmentTypeBadge type={assessment.assessmentType} />
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div className="space-y-4">
						{/* Meta Information */}
						<div className="grid grid-cols-2 gap-4 text-sm">
							{/* Assessment Type Details */}
							<div className="text-muted-foreground flex items-center gap-2">
								<FileText className="h-4 w-4" />
								<span>{assessment.administrationTiming || "Unknown"}</span>
							</div>

							{/* Due Date */}
							{assessment.dueDate && (
								<div className="text-muted-foreground flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									<span>{new Date(assessment.dueDate).toLocaleDateString()}</span>
								</div>
							)}

							{/* Passing Score */}
							{assessment.passingScore && (
								<div className="text-muted-foreground flex items-center gap-2">
									<CheckCircle className="h-4 w-4" />
									<span>Pass: {assessment.passingScore}%</span>
								</div>
							)}

							{/* Training Engagement Link */}
							{assessment.trainingEngagement && (
								<div className="text-muted-foreground flex items-center gap-2">
									<Clock className="h-4 w-4" />
									<Link
										href={`/training-support/${assessment.trainingEngagement.id}`}
										className="truncate hover:underline">
										{assessment.trainingEngagement.title}
									</Link>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex gap-2 pt-2">
							<Button
								asChild
								variant="outline"
								size="sm"
								className="flex-1">
								<Link href={`/training-support/assessments/${assessment.id}`}>View Details</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="sm"
								className="flex-1">
								<Link href={`/training-support/assessments/${assessment.id}/edit`}>Edit</Link>
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowDeleteDialog(true)}
								disabled={isDeleting}
								className="text-destructive hover:text-destructive">
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

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
