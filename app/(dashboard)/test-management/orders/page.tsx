import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { ENGAGEMENT_STATUSES } from "@/lib/config/module-types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestOrderList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Test Orders");

export const revalidate = 0;

export default async function TestOrdersPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Test Orders"
				description="Manage test orders and their associated samples and tests"
				searchPlaceholder="Search test orders..."
				addButtonLabel="Create Test Order"
				addButtonHref="/test-management/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={ENGAGEMENT_STATUSES as unknown as { value: string; label: string }[]}
				clearHref={search || status !== "ALL" ? "/test-management/orders" : undefined}
			/>

			{/* Test Order List */}
			<Suspense fallback={<PageLoading />}>
				<TestOrderList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
