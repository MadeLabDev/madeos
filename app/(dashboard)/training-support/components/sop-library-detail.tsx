"use client";

import { useState } from "react";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SOPLibraryWithRelations } from "@/lib/features/sop-library";
import { deleteSOPAction } from "@/lib/features/sop-library";

import { SOPStatusBadge } from "./sop-status-badge";

interface SOPLibraryDetailProps {
	sop: SOPLibraryWithRelations;
}

export function SOPLibraryDetail({ sop }: SOPLibraryDetailProps) {
	const router = useRouter();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteSOPAction(sop.id);
			if (result.success) {
				toast.success("SOP Library deleted successfully");
				router.push("/training-support/sop-library");
				router.refresh();
			} else {
				toast.error(result.message || "Failed to delete SOP Library");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the SOP Library");
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
							<h1 className="text-3xl font-bold tracking-tight">{sop.title}</h1>
							<SOPStatusBadge status={sop.status} />
						</div>
						<p className="text-muted-foreground">
							Version {sop.version} {sop.description && `• ${sop.description}`}
						</p>
					</div>
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => router.back()}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<Button asChild>
							<Link href={`/training-support/sop-library/${sop.id}/edit`}>
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

				{/* Content Card */}
				<Card>
					<CardHeader>
						<CardTitle>Content</CardTitle>
						<CardDescription>Standard Operating Procedure documentation</CardDescription>
					</CardHeader>
					<CardContent className="prose prose-sm max-w-none">
						<div className="bg-muted rounded-md p-4 text-sm whitespace-pre-wrap">{sop.content}</div>
					</CardContent>
				</Card>

				{/* Details Card */}
				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
						<CardDescription>SOP Library information and metadata</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Category */}
							{sop.category && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Category</h3>
									<p className="mt-1 text-lg font-semibold">{sop.category}</p>
								</div>
							)}

							{/* Version */}
							<div>
								<h3 className="text-muted-foreground text-sm font-medium">Version</h3>
								<p className="mt-1 text-lg font-semibold">{sop.version}</p>
							</div>

							{/* Status */}
							<div>
								<h3 className="text-muted-foreground text-sm font-medium">Status</h3>
								<div className="mt-1">
									<SOPStatusBadge status={sop.status} />
								</div>
							</div>

							{/* Effective Date */}
							{sop.effectiveDate && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Effective Date</h3>
									<p className="mt-1 text-lg font-semibold">{new Date(sop.effectiveDate).toLocaleDateString()}</p>
								</div>
							)}

							{/* Sunset Date */}
							{sop.sunsetDate && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Sunset Date</h3>
									<p className="mt-1 text-lg font-semibold">{new Date(sop.sunsetDate).toLocaleDateString()}</p>
								</div>
							)}

							{/* Review Cycle */}
							<div>
								<h3 className="text-muted-foreground text-sm font-medium">Review Cycle</h3>
								<p className="mt-1 text-lg font-semibold">{sop.reviewCycleMonths} months</p>
							</div>

							{/* Applicable Departments */}
							{sop.applicableDepartments && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Applicable Departments</h3>
									<p className="mt-1 text-lg font-semibold">{sop.applicableDepartments}</p>
								</div>
							)}

							{/* Applicable Roles */}
							{sop.applicableRoles && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Applicable Roles</h3>
									<p className="mt-1 text-lg font-semibold">{sop.applicableRoles}</p>
								</div>
							)}

							{/* Required Certifications */}
							{sop.requiredCertifications && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Required Certifications</h3>
									<p className="mt-1 text-lg font-semibold">{sop.requiredCertifications}</p>
								</div>
							)}

							{/* Last Reviewed */}
							{sop.lastReviewedAt && (
								<div>
									<h3 className="text-muted-foreground text-sm font-medium">Last Reviewed</h3>
									<p className="mt-1 text-lg font-semibold">{new Date(sop.lastReviewedAt).toLocaleString()}</p>
								</div>
							)}
						</div>

						{/* Version Notes */}
						{sop.versionNotes && (
							<div className="border-t pt-4">
								<h3 className="text-muted-foreground mb-2 text-sm font-medium">Version Notes</h3>
								<div className="bg-muted rounded-md p-4">
									<p className="text-sm whitespace-pre-wrap">{sop.versionNotes}</p>
								</div>
							</div>
						)}

						{/* Created/Updated Info */}
						<div className="text-muted-foreground space-y-1 border-t pt-4 text-xs">
							<p>Created: {new Date(sop.createdAt).toLocaleString()}</p>
							<p>Last Updated: {new Date(sop.updatedAt).toLocaleString()}</p>
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
						<AlertDialogTitle>Delete SOP Library</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{sop.title}"? This action cannot be undone.</AlertDialogDescription>
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
