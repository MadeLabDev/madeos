import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignReviewList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design Reviews");

export const revalidate = 0;

export default async function DesignReviewsPage({ searchParams }: { searchParams: Promise<{ search?: string; approvalStatus?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const approvalStatus = params.approvalStatus || "";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			<ListPageHeader
				title="Design Reviews"
				description="Track feedback and approvals from clients and stakeholders."
				searchPlaceholder="Search design reviews..."
				addButtonLabel="New Design Review"
				addButtonHref="/design-projects/design-reviews/new"
				search={search}
				statusFilter={approvalStatus}
				showFilters={true}
				statusOptions={[
					{ value: "PENDING", label: "Pending" },
					{ value: "IN_PROGRESS", label: "In Progress" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "REJECTED", label: "Rejected" },
					{ value: "REVISION_REQUESTED", label: "Revision Requested" },
					{ value: "CLOSED", label: "Closed" },
				]}
				clearHref={search || approvalStatus ? "/design-projects/design-reviews" : undefined}
			/>

			<Suspense fallback={<PageLoading />}>
				<DesignReviewList
					page={page}
					pageSize={pageSize}
					search={search}
					approvalStatus={approvalStatus}
				/>
			</Suspense>
		</div>
	);
}
