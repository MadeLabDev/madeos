import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignProjectList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design Projects");

export const revalidate = 0;

export default async function DesignProjectsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Design Projects"
				description="Manage design projects and their associated designs and reviews"
				searchPlaceholder="Search design projects..."
				addButtonLabel="Create Design Project"
				addButtonHref="/design-projects/projects/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "DRAFT", label: "Draft" },
					{ value: "CONCEPT", label: "Concept" },
					{ value: "FEASIBILITY", label: "Feasibility" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "COMPLETED", label: "Completed" },
					{ value: "ON_HOLD", label: "On Hold" },
					{ value: "CANCELLED", label: "Cancelled" },
				]}
				clearHref={search || status !== "ALL" ? "/design-projects/projects" : undefined}
			/>

			{/* Design Project List */}
			<Suspense fallback={<PageLoading />}>
				<DesignProjectList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
