import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ModuleInstancesList } from "../components";

export const dynamic = "force-dynamic";

export const revalidate = 0;
export const metadata = generateCrudMetadata("Module Instances");

export default async function ModuleInstancesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Module Instances"
				description="Create and manage module instances based on defined types"
				searchPlaceholder="Search by entity name or ID..."
				addButtonLabel="Create Module Instance"
				addButtonHref="/meta/module-instances/new"
				search={search}
				clearHref={search ? "/meta/module-instances" : undefined}
			/>

			{/* Module Instances List */}
			<Suspense fallback={<PageLoading />}>
				<ModuleInstancesList
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
