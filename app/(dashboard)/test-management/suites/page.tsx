import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestSuiteList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Test Suites");

export const revalidate = 0;

export default async function TestSuitesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Test Suites"
				description="Manage standardized test suites and templates"
				searchPlaceholder="Search by name or description..."
				addButtonLabel="Create Test Suite"
				addButtonHref="/test-management/suites/new"
				search={search}
				clearHref={search ? "/test-management/suites" : undefined}
			/>

			{/* Test Suites List */}
			<Suspense fallback={<PageLoading />}>
				<TestSuiteList
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
