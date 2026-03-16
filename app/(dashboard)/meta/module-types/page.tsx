import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ModuleTypesList } from "../components";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export const metadata = generateCrudMetadata("Module Types");

// Force dynamic rendering - prevent automatic revalidation
export default async function ModuleTypesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Module Types"
				description="Define field schemas and data structures for different modules"
				searchPlaceholder="Search by module type name..."
				addButtonLabel="Create Module Type"
				addButtonHref="/meta/module-types/new"
				search={search}
				clearHref={search ? "/meta/module-types" : undefined}
			/>

			{/* Module Types List */}
			<Suspense fallback={<PageLoading />}>
				<ModuleTypesList
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
