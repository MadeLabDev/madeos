"use client";

import { useCallback, useEffect, useState } from "react";

import { MoreHorizontal, Pencil, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/lib/contexts/breadcrumb-context";
import { deleteDesignProject, getDesignProjectById } from "@/lib/features/design/actions";
import { DesignProjectWithRelations } from "@/lib/features/design/types";
import { getUsersAction } from "@/lib/features/users/actions";
import { formatDate } from "@/lib/utils";

import { DesignBriefModal } from "./design-brief-modal";
import { DesignReviewModal } from "./design-review-modal";
import { ProductDesignModal } from "./product-design-modal";

interface DesignProjectDetailProps {
	designProjectId: string;
}

export function DesignProjectDetail({ designProjectId }: DesignProjectDetailProps) {
	const router = useRouter();
	const { setOverride } = useBreadcrumb();
	const [designProject, setDesignProject] = useState<DesignProjectWithRelations | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [users, setUsers] = useState<any[]>([]);

	const loadDesignProject = useCallback(async () => {
		try {
			setLoading(true);
			const result = await getDesignProjectById(designProjectId);
			if (result.success && result.data) {
				setDesignProject(result.data);
				setOverride(designProjectId, result.data.title);
			} else {
				toast.error("Failed to load design project");
				router.push("/design-projects/projects");
			}
		} catch (error) {
			toast.error("Failed to load design project");
			router.push("/design-projects/projects");
		} finally {
			setLoading(false);
		}
	}, [designProjectId, router, setOverride]);

	const loadUsers = useCallback(async () => {
		try {
			const result = await getUsersAction({ pageSize: 100 });
			if (result.success && result.data) {
				setUsers((result.data as any).users || []);
			}
		} catch (error) {
			console.error("Failed to load users:", error);
		}
	}, []);

	useEffect(() => {
		loadDesignProject();
		loadUsers();
	}, [designProjectId, refreshKey, loadDesignProject, loadUsers]);

	const getUserName = (userId: string) => {
		const user = users.find((u) => u.id === userId);
		return user ? user.name : "Unknown User";
	};

	const handleDelete = async () => {
		setDeleting(true);
		try {
			const result = await deleteDesignProject(designProjectId);
			if (result.success) {
				toast.success("Design project deleted successfully");
				router.push("/design-projects/projects");
			} else {
				toast.error(result.message || "Failed to delete design project");
			}
		} catch (error) {
			toast.error("Failed to delete design project");
		} finally {
			setDeleting(false);
		}
	};

	if (loading) {
		return <Loader />;
	}

	if (!designProject) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Design project not found</p>
				<Button
					asChild
					className="mt-4">
					<Link href="/design-projects/projects">Back to Design Projects</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{designProject.title}</h1>
					<p className="text-muted-foreground">{designProject.description}</p>
				</div>
				<div className="flex gap-3">
					<Button
						asChild
						variant="outline">
						<Link href={`/design-projects/projects/${designProject.id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</Link>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => setDeleteDialogOpen(true)}>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Status and Key Info */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Status</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge variant={designProject.status === "APPROVED" ? "default" : designProject.status === "DRAFT" ? "secondary" : designProject.status === "COMPLETED" ? "outline" : "outline"}>{designProject.status}</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Priority</CardTitle>
					</CardHeader>
					<CardContent>
						<Badge variant={designProject.priority === "HIGH" ? "destructive" : designProject.priority === "MEDIUM" ? "default" : "secondary"}>{designProject.priority}</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Due Date</CardTitle>
					</CardHeader>
					<CardContent>{designProject.dueDate ? formatDate(designProject.dueDate) : "No due date"}</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Budget</CardTitle>
					</CardHeader>
					<CardContent>{designProject.budget ? `$${designProject.budget.toLocaleString()}` : "No budget set"}</CardContent>
				</Card>
			</div>

			{/* Main Content Tabs */}
			<Tabs
				defaultValue="overview"
				className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="designs">Designs</TabsTrigger>
					<TabsTrigger value="brief">Brief</TabsTrigger>
					<TabsTrigger value="reviews">Reviews</TabsTrigger>
				</TabsList>

				<TabsContent
					value="overview"
					className="space-y-4">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Project Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Engagement</label>
									<p>{designProject.engagementId || "Unknown Engagement"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Customer</label>
									<p>{designProject.customer ? designProject.customer.companyName : "Unknown Customer"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Requested By</label>
									<p>{getUserName(designProject.requestedBy)}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Assigned To</label>
									<p>{designProject.assignedTo ? getUserName(designProject.assignedTo) : "Unassigned"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Start Date</label>
									<p>{designProject.startDate ? formatDate(designProject.startDate) : "Not set"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Created</label>
									<p>{formatDate(designProject.createdAt)}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Progress Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<label className="text-muted-foreground text-sm font-medium">Designs</label>
									<p>{designProject.designs?.length || 0} designs</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Brief Status</label>
									<p>{designProject.brief?.status || "Not created"}</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Reviews</label>
									<p>{designProject.reviews?.length || 0} reviews</p>
								</div>
								<div>
									<label className="text-muted-foreground text-sm font-medium">Deck Status</label>
									<p>{designProject.deck?.status || "Not created"}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent
					value="designs"
					className="space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Product Designs</CardTitle>
							<ProductDesignModal
								designProjectId={designProject.id}
								onSuccess={() => setRefreshKey((prev) => prev + 1)}>
								<Button size="sm">
									<Save className="mr-2 h-4 w-4" />
									Add Design
								</Button>
							</ProductDesignModal>
						</CardHeader>
						<CardContent>
							{designProject.designs && designProject.designs.length > 0 ? (
								<div className="space-y-4">
									{designProject.designs.map((design) => (
										<div
											key={design.id}
											className="flex items-center justify-between rounded-lg border p-4">
											<div>
												<h4 className="font-medium">{design.name}</h4>
												<p className="text-muted-foreground text-sm">{design.description}</p>
												<div className="mt-2 flex flex-wrap gap-2">
													<Badge variant="outline">{design.designType}</Badge>
													<Badge variant={design.status === "APPROVED" ? "default" : design.status === "DRAFT" ? "secondary" : "outline"}>{design.status}</Badge>
												</div>
											</div>
											<Button
												variant="ghost"
												size="sm">
												View
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center">
									<p className="text-muted-foreground">No designs yet</p>
									<ProductDesignModal
										designProjectId={designProject.id}
										onSuccess={() => setRefreshKey((prev) => prev + 1)}>
										<Button
											size="sm"
											className="mt-2">
											<Save className="mr-2 h-4 w-4" />
											Create First Design
										</Button>
									</ProductDesignModal>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					value="brief"
					className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Design Brief</CardTitle>
						</CardHeader>
						<CardContent>
							{designProject.brief ? (
								<div className="space-y-4">
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div>
											<label className="text-muted-foreground text-sm font-medium">Target Audience</label>
											<p>{designProject.brief.targetAudience || "Not specified"}</p>
										</div>
										<div>
											<label className="text-muted-foreground text-sm font-medium">Budget</label>
											<p>{designProject.brief.budget ? `$${designProject.brief.budget.toLocaleString()}` : "Not specified"}</p>
										</div>
										<div>
											<label className="text-muted-foreground text-sm font-medium">Timeline</label>
											<p>{designProject.brief.timeline || "Not specified"}</p>
										</div>
										<div>
											<label className="text-muted-foreground text-sm font-medium">Status</label>
											<Badge variant={designProject.brief.status === "APPROVED" ? "default" : "secondary"}>{designProject.brief.status}</Badge>
										</div>
									</div>
									<div>
										<label className="text-muted-foreground text-sm font-medium">Constraints</label>
										<p>{designProject.brief.constraints || "None specified"}</p>
									</div>
									<div>
										<label className="text-muted-foreground text-sm font-medium">Inspirations</label>
										<p>{designProject.brief.inspirations || "None specified"}</p>
									</div>
									<div>
										<label className="text-muted-foreground text-sm font-medium">Deliverables</label>
										<p>{designProject.brief.deliverables || "Not specified"}</p>
									</div>
									<div>
										<label className="text-muted-foreground text-sm font-medium">Notes</label>
										<p>{designProject.brief.notes || "No additional notes"}</p>
									</div>
								</div>
							) : (
								<div className="py-8 text-center">
									<p className="text-muted-foreground">No design brief created yet</p>
									<DesignBriefModal designProjectId={designProject.id}>
										<Button
											size="sm"
											className="mt-2">
											<Save className="mr-2 h-4 w-4" />
											Create Brief
										</Button>
									</DesignBriefModal>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent
					value="reviews"
					className="space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Reviews & Feedback</CardTitle>
							<DesignReviewModal
								designProjectId={designProject.id}
								onSuccess={() => setRefreshKey((prev) => prev + 1)}>
								<Button size="sm">
									<Save className="mr-2 h-4 w-4" />
									Add Review
								</Button>
							</DesignReviewModal>
						</CardHeader>
						<CardContent>
							{designProject.reviews && designProject.reviews.length > 0 ? (
								<div className="space-y-4">
									{designProject.reviews.map((review) => (
										<div
											key={review.id}
											className="rounded-lg border p-4">
											<div className="mb-2 flex items-center justify-between">
												<h4 className="font-medium">{review.reviewerName}</h4>
												<Badge variant={review.approvalStatus === "APPROVED" ? "default" : review.approvalStatus === "DRAFT" ? "secondary" : "outline"}>{review.approvalStatus}</Badge>
											</div>
											{review.reviewerEmail && <p className="text-muted-foreground mb-2 text-sm">{review.reviewerEmail}</p>}
											{review.feedback && <p className="text-sm">{review.feedback}</p>}
											{review.notes && <p className="text-muted-foreground mt-2 text-sm">{review.notes}</p>}
											<div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
												<span>Review</span>
												<span>{formatDate(review.createdAt)}</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="py-8 text-center">
									<p className="text-muted-foreground">No reviews yet</p>
									<DesignReviewModal
										designProjectId={designProject.id}
										onSuccess={() => setRefreshKey((prev) => prev + 1)}>
										<Button
											size="sm"
											className="mt-2">
											<Save className="mr-2 h-4 w-4" />
											Add First Review
										</Button>
									</DesignReviewModal>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Delete Dialog */}
			<DeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Design Project"
				description={`Are you sure you want to delete "${designProject.title}"? This action cannot be undone.`}
				onConfirm={handleDelete}
				isDeleting={deleting}
			/>
		</div>
	);
}
