import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { ENGAGEMENT_STATUSES } from "@/lib/config/module-types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EngagementList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Engagements");

export const revalidate = 0;

export default async function EngagementsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; customerId?: string; status?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const customerId = params.customerId || "";
	const status = params.status || "ALL";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Engagements"
				description="Manage customer engagements and projects"
				searchPlaceholder="Search engagements by title, customer, or description..."
				addButtonLabel="Add Engagement"
				addButtonHref="/engagements/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={ENGAGEMENT_STATUSES as unknown as { value: string; label: string }[]}
				clearHref={search || status !== "ALL" ? "/engagements" : undefined}
			/>

			{/* Engagements List */}
			<Suspense fallback={<PageLoading />}>
				<EngagementList
					page={page}
					search={search}
					pageSize={pageSize}
					customerId={customerId}
					status={status}
				/>
			</Suspense>
		</div>
	);
}
