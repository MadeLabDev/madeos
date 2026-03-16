import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestReportList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Test Reports");

export const revalidate = 0;

export default async function TestReportsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Test Reports"
				description="Manage test reports and documentation"
				searchPlaceholder="Search reports..."
				addButtonLabel="Create Report"
				addButtonHref="/test-management/reports/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				clearHref={search || status !== "ALL" ? "/test-management/reports" : undefined}
			/>

			{/* Test Reports List */}
			<Suspense fallback={<PageLoading />}>
				<TestReportList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
