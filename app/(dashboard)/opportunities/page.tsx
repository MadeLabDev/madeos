import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { OpportunityList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Opportunities");

export const revalidate = 0;

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; customerId?: string; stage?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const customerId = params.customerId || "";
	const stage = params.stage || "";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Opportunities"
				description="Manage sales opportunities and pipeline"
				searchPlaceholder="Search by title, description, or source..."
				addButtonLabel="Add Opportunity"
				addButtonHref="/opportunities/new"
				search={search}
				clearHref={search ? "/opportunities" : undefined}
			/>

			{/* Opportunities List */}
			<Suspense fallback={<PageLoading />}>
				<OpportunityList
					page={page}
					search={search}
					pageSize={pageSize}
					customerId={customerId}
					stage={stage}
				/>
			</Suspense>
		</div>
	);
}
