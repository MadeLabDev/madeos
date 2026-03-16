import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestOrderList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Testing");

export const revalidate = 0;

export default async function TestingPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Testing"
				description="Manage test orders, samples, and reports"
				searchPlaceholder="Search test orders..."
				addButtonLabel="Create Test Order"
				addButtonHref="/test-management/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				clearHref={search || status !== "ALL" ? "/testing" : undefined}
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
