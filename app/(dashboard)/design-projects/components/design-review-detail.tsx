import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDesignReviewById } from "@/lib/features/design/actions";

interface DesignReviewDetailProps {
	reviewId: string;
}

export async function DesignReviewDetail({ reviewId }: DesignReviewDetailProps) {
	const result = await getDesignReviewById(reviewId);

	if (!result.success || !result.data) {
		notFound();
	}

	const review = result.data;

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
				return "secondary";
			case "APPROVED":
				return "default";
			case "REJECTED":
				return "destructive";
			case "REVISION_REQUESTED":
				return "outline";
			case "IN_PROGRESS":
				return "default";
			case "CLOSED":
				return "secondary";
			default:
				return "secondary";
		}
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="sm"
						asChild>
						<Link href="/design/design-reviews">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Reviews
						</Link>
					</Button>
					<div>
						<h1 className="text-2xl font-bold">{`Review by ${review.reviewerName}`}</h1>
						<p className="text-muted-foreground">Design Review Details</p>
					</div>
				</div>
				<Button asChild>
					<Link href={`/design/design-reviews/${reviewId}/edit`}>
						<Edit className="mr-2 h-4 w-4" />
						Edit Review
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<div className="space-y-6 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Review Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Status</label>
									<div className="mt-1">
										<Badge variant={getStatusColor(review.approvalStatus)}>{review.approvalStatus.replace("_", " ")}</Badge>
									</div>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Reviewer</label>
									<p className="mt-1">{review.reviewerName}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Design Project</label>
									<p className="mt-1">{review.designProject?.title || `Project ${review.designProjectId}`}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Product Design</label>
									<p className="mt-1">{review.productDesign?.name || "Not specified"}</p>
								</div>
							</div>

							{review.reviewerEmail && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Reviewer Email</label>
									<p className="mt-1">{review.reviewerEmail}</p>
								</div>
							)}

							{review.feedback && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Feedback</label>
									<p className="mt-1 whitespace-pre-wrap">{review.feedback}</p>
								</div>
							)}

							{review.notes && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Notes</label>
									<p className="mt-1 whitespace-pre-wrap">{review.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Project Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-muted-foreground text-sm font-medium">Design Project</label>
								<p className="mt-1">
									<Link
										href={`/design/projects/${review.designProjectId}`}
										className="text-primary hover:underline">
										{`Project ${review.designProjectId}`}
									</Link>
								</p>
							</div>

							{review.productDesignId && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Product Design</label>
									<p className="mt-1">
										<Link
											href={`/design/designs/${review.productDesignId}`}
											className="text-primary hover:underline">
											{`Design ${review.productDesignId}`}
										</Link>
									</p>
								</div>
							)}

							<Separator />

							<div>
								<label className="text-muted-foreground text-sm font-medium">Created</label>
								<p className="mt-1 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
							</div>

							{review.updatedAt !== review.createdAt && (
								<div>
									<label className="text-muted-foreground text-sm font-medium">Last Updated</label>
									<p className="mt-1 text-sm">{new Date(review.updatedAt).toLocaleDateString()}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
