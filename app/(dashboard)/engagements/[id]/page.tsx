import { Suspense } from "react";

import { format } from "date-fns";
import { Building2, Calendar, Clock, DollarSign, Pencil, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getEngagementByIdAction } from "@/lib/features/customers";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Engagement");

export const revalidate = 0;

export default async function EngagementDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getEngagementByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const engagement = result.data as any;

	// Status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "DRAFT":
				return <Badge variant="outline">Draft</Badge>;
			case "ACTIVE":
				return <Badge variant="default">Active</Badge>;
			case "ON_HOLD":
				return <Badge variant="secondary">On Hold</Badge>;
			case "COMPLETED":
				return (
					<Badge
						variant="default"
						className="bg-green-500">
						Completed
					</Badge>
				);
			case "CANCELLED":
				return <Badge variant="destructive">Cancelled</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	// Type badge
	const getTypeBadge = (type: string) => {
		switch (type) {
			case "DESIGN":
				return <Badge variant="default">Design</Badge>;
			case "TESTING":
				return <Badge variant="secondary">Testing</Badge>;
			case "TRAINING":
				return <Badge variant="outline">Training</Badge>;
			case "EVENT":
				return <Badge variant="outline">Event</Badge>;
			default:
				return <Badge variant="outline">{type}</Badge>;
		}
	};

	// Priority badge
	const getPriorityBadge = (priority: string) => {
		switch (priority) {
			case "HIGH":
				return <Badge variant="destructive">High</Badge>;
			case "MEDIUM":
				return <Badge variant="default">Medium</Badge>;
			case "LOW":
				return <Badge variant="secondary">Low</Badge>;
			default:
				return <Badge variant="outline">{priority || "Medium"}</Badge>;
		}
	};

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={engagement.title}
			/>

			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold">{engagement.title}</h1>
							<div className="mt-2 flex items-center gap-2">
								{getTypeBadge(engagement.type)}
								{getStatusBadge(engagement.status)}
								{getPriorityBadge(engagement.priority)}
							</div>
						</div>
						<div className="flex gap-2">
							<Link href={`/engagements/${id}/edit`}>
								<Button>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							</Link>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						{/* Main Information */}
						<div className="space-y-6 lg:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Engagement Details</CardTitle>
									<CardDescription>Basic information about this engagement</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										<div>
											<p className="text-muted-foreground text-sm">Customer</p>
											<Link
												href={`/customers/${engagement.customerId}`}
												className="flex items-center gap-2 font-medium underline">
												<Building2 className="h-4 w-4" />
												{engagement.customer?.companyName || "N/A"}
											</Link>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">Assigned To</p>
											<div className="flex items-center gap-2">
												<User className="text-muted-foreground h-4 w-4" />
												<span className="font-medium">{engagement.assignedTo || "Unassigned"}</span>
											</div>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">Start Date</p>
											<div className="flex items-center gap-2">
												<Calendar className="text-muted-foreground h-4 w-4" />
												<span className="font-medium">{engagement.startDate ? format(new Date(engagement.startDate), "PPP") : "Not set"}</span>
											</div>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">Due Date</p>
											<div className="flex items-center gap-2">
												<Clock className="text-muted-foreground h-4 w-4" />
												<span className="font-medium">{engagement.dueDate ? format(new Date(engagement.dueDate), "PPP") : "Not set"}</span>
											</div>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">Budget</p>
											<div className="flex items-center gap-2">
												<DollarSign className="text-muted-foreground h-4 w-4" />
												<span className="font-medium">{engagement.budget ? `$${engagement.budget.toLocaleString()}` : "Not set"}</span>
											</div>
										</div>
										<div>
											<p className="text-muted-foreground text-sm">Created</p>
											<span className="font-medium">{format(new Date(engagement.createdAt), "PPP")}</span>
										</div>
									</div>

									{engagement.description && (
										<div>
											<p className="text-muted-foreground mb-2 text-sm">Description</p>
											<p className="text-sm leading-relaxed">{engagement.description}</p>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Related Test Orders (if any) */}
							{engagement.testOrders && engagement.testOrders.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>Related Test Orders</CardTitle>
										<CardDescription>Test orders associated with this engagement</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											{engagement.testOrders.map((order: any) => (
												<Link
													key={order.id}
													href={`/testing/orders/${order.id}`}
													className="hover:bg-muted/50 block rounded-lg border p-3 transition-colors">
													<div className="flex items-start justify-between">
														<div>
															<p className="font-medium">{order.title}</p>
															<p className="text-muted-foreground text-sm">{order.description}</p>
														</div>
														<Badge variant="outline">{order.status}</Badge>
													</div>
												</Link>
											))}
										</div>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Link href={`/engagements/${id}/edit`}>
										<Button
											className="w-full"
											variant="outline">
											Edit Engagement
										</Button>
									</Link>
									<Link href={`/customers/${engagement.customerId}`}>
										<Button
											className="w-full"
											variant="outline">
											View Customer
										</Button>
									</Link>
									{engagement.type === "TESTING" && (
										<Link href={`/testing/orders/new?engagementId=${id}`}>
											<Button
												className="w-full"
												variant="outline">
												Create Test Order
											</Button>
										</Link>
									)}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Timeline</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
											<div>
												<p className="text-sm font-medium">Created</p>
												<p className="text-muted-foreground text-xs">{format(new Date(engagement.createdAt), "PPP 'at' p")}</p>
											</div>
										</div>
										{engagement.updatedAt !== engagement.createdAt && (
											<div className="flex items-start gap-3">
												<div className="mt-2 h-2 w-2 rounded-full bg-yellow-500"></div>
												<div>
													<p className="text-sm font-medium">Last Updated</p>
													<p className="text-muted-foreground text-xs">{format(new Date(engagement.updatedAt), "PPP 'at' p")}</p>
												</div>
											</div>
										)}
										{engagement.completedAt && (
											<div className="flex items-start gap-3">
												<div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
												<div>
													<p className="text-sm font-medium">Completed</p>
													<p className="text-muted-foreground text-xs">{format(new Date(engagement.completedAt), "PPP 'at' p")}</p>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</Suspense>
			</div>
		</>
	);
}
