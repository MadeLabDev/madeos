import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignBriefList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design Briefs");

export const revalidate = 0;

export default async function DesignBriefsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Design Briefs"
				description="Manage design briefs and requirements for all design projects"
				searchPlaceholder="Search design briefs..."
				addButtonLabel="Create Design Brief"
				addButtonHref="/design-projects/briefs/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "PENDING", label: "Pending" },
					{ value: "SUBMITTED", label: "Submitted" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "REJECTED", label: "Rejected" },
					{ value: "REVISION_REQUESTED", label: "Revision Requested" },
				]}
				clearHref={search || status !== "ALL" ? "/design-projects/briefs" : undefined}
			/>

			{/* Design Brief List */}
			<Suspense fallback={<PageLoading />}>
				<DesignBriefList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
