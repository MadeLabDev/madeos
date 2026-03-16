import { Suspense } from "react";

import { Calendar, Pencil, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/page-loading";
import { getMarketingCampaignAction } from "@/lib/features/marketing/actions";
import { formatDate } from "@/lib/utils";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Marketing Campaigns");

export const revalidate = 0;

export default async function MarketingCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const campaign = await getMarketingCampaignAction(id);

	if (!campaign) {
		notFound();
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={campaign.title}
				/>

				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">{campaign.title}</h1>
						<div className="mt-2 flex items-center gap-2">
							<Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
							<Badge variant="outline">{campaign.type}</Badge>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							asChild
							variant="outline">
							<Link href={`/marketing/campaigns/${id}/edit`}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</Button>
						{campaign.status === "DRAFT" && (
							<Button variant="default">
								<Send className="mr-2 h-4 w-4" />
								Send Now
							</Button>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{/* Main Content */}
					<div className="space-y-6 md:col-span-2">
						<Card className="p-6">
							<h2 className="mb-4 text-xl font-semibold">Campaign Details</h2>
							<div className="space-y-4">
								{campaign.description && (
									<div>
										<label className="text-muted-foreground text-sm font-medium">Description</label>
										<p className="mt-1">{campaign.description}</p>
									</div>
								)}
								{campaign.targetAudience && (
									<div>
										<label className="text-muted-foreground text-sm font-medium">Target Audience</label>
										<p className="mt-1">{campaign.targetAudience}</p>
									</div>
								)}
							</div>
						</Card>

						{/* Campaign Emails or other content can go here */}
						<Card className="p-6">
							<h2 className="mb-4 text-xl font-semibold">Campaign Content</h2>
							<p className="text-muted-foreground">Content management coming soon...</p>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<Card className="p-6">
							<h3 className="mb-4 text-lg font-semibold">Schedule</h3>
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<Calendar className="text-muted-foreground h-4 w-4" />
									<div>
										<p className="text-sm font-medium">Created</p>
										<p className="text-muted-foreground text-sm">{formatDate(campaign.createdAt)}</p>
									</div>
								</div>
								{campaign.scheduledAt && (
									<div className="flex items-center gap-2">
										<Calendar className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Scheduled</p>
											<p className="text-muted-foreground text-sm">{formatDate(campaign.scheduledAt)}</p>
										</div>
									</div>
								)}
								{campaign.sentAt && (
									<div className="flex items-center gap-2">
										<Send className="text-muted-foreground h-4 w-4" />
										<div>
											<p className="text-sm font-medium">Sent</p>
											<p className="text-muted-foreground text-sm">{formatDate(campaign.sentAt)}</p>
										</div>
									</div>
								)}
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="mb-4 text-lg font-semibold">Created By</h3>
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
									<span className="text-sm font-medium">
										{campaign.createdBy?.firstName?.[0]}
										{campaign.createdBy?.lastName?.[0]}
									</span>
								</div>
								<div>
									<p className="text-sm font-medium">
										{campaign.createdBy?.firstName} {campaign.createdBy?.lastName}
									</p>
									<p className="text-muted-foreground text-sm">{campaign.createdBy?.email}</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</>
		</Suspense>
	);
}

function getStatusVariant(status: string) {
	switch (status) {
		case "DRAFT":
			return "secondary";
		case "SCHEDULED":
			return "default";
		case "SENDING":
			return "default";
		case "SENT":
			return "default";
		case "CANCELLED":
			return "destructive";
		default:
			return "outline";
	}
}
