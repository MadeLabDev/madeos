import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { MarketingCampaignList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Marketing Campaigns");

export const revalidate = 0;

export default async function MarketingCampaignsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Marketing Campaigns"
				description="Manage your email campaigns and marketing communications"
				searchPlaceholder="Search campaigns..."
				addButtonLabel="Create Campaign"
				addButtonHref="/marketing/campaigns/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "DRAFT", label: "Draft" },
					{ value: "SCHEDULED", label: "Scheduled" },
					{ value: "SENDING", label: "Sending" },
					{ value: "SENT", label: "Sent" },
					{ value: "CANCELLED", label: "Cancelled" },
					{ value: "FAILED", label: "Failed" },
				]}
				clearHref={search || status !== "ALL" ? "/marketing/campaigns" : undefined}
			/>

			{/* Marketing Campaign List */}
			<Suspense fallback={<PageLoading />}>
				<MarketingCampaignList
					search={search}
					statusFilter={status}
					page={1}
					pageSize={20}
				/>
			</Suspense>
		</div>
	);
}
