"use client";

import { useEffect, useState } from "react";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { DesignReviewStatus } from "@/generated/prisma/enums";
import { deleteDesignReview, getDesignReview } from "@/lib/features/design/actions";

interface DesignReviewDetailProps {
	id: string;
}

export function DesignReviewDetail({ id }: DesignReviewDetailProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [data, setData] = useState<any>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const result = await getDesignReview(id);
				if (result.success && result.data) {
					setData(result.data);
				} else {
					toast.error("Failed to load design review");
					router.push("/design-projects/design-reviews");
				}
			} catch (error) {
				toast.error("Failed to load design review");
				router.push("/design-projects/design-reviews");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [id, router]);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this design review?")) {
			return;
		}

		try {
			setDeleting(true);
			const result = await deleteDesignReview(id);
			if (result.success) {
				toast.success("Design review deleted successfully");
				router.push("/design-projects/design-reviews");
			} else {
				toast.error(result.message || "Failed to delete design review");
			}
		} catch (error) {
			toast.error("Failed to delete design review");
		} finally {
			setDeleting(false);
		}
	};

	const getStatusColor = (status: DesignReviewStatus) => {
		switch (status) {
			case DesignReviewStatus.PENDING:
				return "secondary";
			case DesignReviewStatus.APPROVED:
				return "default";
			case DesignReviewStatus.REVISION_REQUESTED:
				return "destructive";
			case DesignReviewStatus.REJECTED:
				return "destructive";
			case DesignReviewStatus.CLOSED:
				return "outline";
			default:
				return "secondary";
		}
	};

	const getReviewTypeLabel = (type: string) => {
		switch (type) {
			case "CUSTOMER":
				return "Customer";
			case "INTERNAL":
				return "Internal";
			case "FEASIBILITY":
				return "Feasibility";
			case "ENGINEERING":
				return "Engineering";
			default:
				return type;
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Loader className="h-8 w-8" />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Design review not found</p>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => router.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{data.title}</h1>
						<p className="text-muted-foreground">Design Review Details</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<Button
						asChild
						variant="outline"
						size="sm">
						<Link href={`/design-projects/design-reviews/${id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleDelete}
						disabled={deleting}>
						<Trash2 className="mr-2 h-4 w-4" />
						{deleting ? "Deleting..." : "Delete"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Review Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Title</label>
							<p className="text-sm">{data.title}</p>
						</div>

						<div>
							<label className="text-muted-foreground text-sm font-medium">Review Type</label>
							<p className="text-sm">{getReviewTypeLabel(data.reviewType)}</p>
						</div>

						<div>
							<label className="text-muted-foreground text-sm font-medium">Status</label>
							<div className="mt-1">
								<Badge variant={getStatusColor(data.status)}>{data.status}</Badge>
							</div>
						</div>

						<div>
							<label className="text-muted-foreground text-sm font-medium">Version</label>
							<p className="text-sm">{data.version}</p>
						</div>

						{data.description && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Description</label>
								<p className="text-sm">{data.description}</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Project & Design</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Design Project ID</label>
							<p className="font-mono text-sm">{data.designProjectId}</p>
						</div>

						{data.productDesignId && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Product Design ID</label>
								<p className="font-mono text-sm">{data.productDesignId}</p>
							</div>
						)}

						{data.reviewedBy && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Reviewed By</label>
								<p className="font-mono text-sm">{data.reviewedBy}</p>
							</div>
						)}

						{data.approvedBy && (
							<div>
								<label className="text-muted-foreground text-sm font-medium">Approved By</label>
								<p className="font-mono text-sm">{data.approvedBy}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{data.feedback && (
				<Card>
					<CardHeader>
						<CardTitle>Feedback</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm whitespace-pre-wrap">{data.feedback}</p>
					</CardContent>
				</Card>
			)}

			{data.requestedChanges && (
				<Card>
					<CardHeader>
						<CardTitle>Requested Changes</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="bg-muted overflow-x-auto rounded-md p-4 text-sm whitespace-pre-wrap">{data.requestedChanges}</pre>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{data.attachments && (
					<Card>
						<CardHeader>
							<CardTitle>Attachments</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-mono text-sm">{data.attachments}</p>
						</CardContent>
					</Card>
				)}

				{data.mediaIds && (
					<Card>
						<CardHeader>
							<CardTitle>Media IDs</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-mono text-sm">{data.mediaIds}</p>
						</CardContent>
					</Card>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Timestamps</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="text-muted-foreground text-sm font-medium">Created</label>
							<p className="text-sm">{new Date(data.createdAt).toLocaleString()}</p>
						</div>
						<div>
							<label className="text-muted-foreground text-sm font-medium">Updated</label>
							<p className="text-sm">{new Date(data.updatedAt).toLocaleString()}</p>
						</div>
					</div>

					{data.reviewedAt && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Reviewed At</label>
							<p className="text-sm">{new Date(data.reviewedAt).toLocaleString()}</p>
						</div>
					)}

					{data.approvedAt && (
						<div>
							<label className="text-muted-foreground text-sm font-medium">Approved At</label>
							<p className="text-sm">{new Date(data.approvedAt).toLocaleString()}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
