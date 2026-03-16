import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignProjectList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design");

export const revalidate = 0;

export default async function DesignPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Design"
				description="Manage design projects, briefs, and creative workflows"
				searchPlaceholder="Search design projects..."
				addButtonLabel="Create Design Project"
				addButtonHref="/design-projects/projects/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "DRAFT", label: "Draft" },
					{ value: "INTAKE", label: "Intake" },
					{ value: "IN_PROGRESS", label: "In Progress" },
					{ value: "REVIEW", label: "Review" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "REJECTED", label: "Rejected" },
					{ value: "REVISION", label: "Revision" },
					{ value: "COMPLETED", label: "Completed" },
					{ value: "ARCHIVED", label: "Archived" },
				]}
				clearHref={search || status !== "ALL" ? "/design" : undefined}
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
