import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { SOPLibraryList, SOPLibraryListRefresh } from "../components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("SOP Library");

export const revalidate = 0;

export default async function SOPLibraryPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="SOP Library"
				description="Manage standard operating procedures and training materials"
				searchPlaceholder="Search SOP library..."
				addButtonLabel="Create SOP"
				addButtonHref="/training-support/sop-library/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "DRAFT", label: "Draft" },
					{ value: "REVIEW", label: "Review" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "ARCHIVED", label: "Archived" },
				]}
				clearHref={search || status !== "ALL" ? "/training-support/sop-library" : undefined}
			/>

			<SOPLibraryListRefresh />
			{/* SOP Library List */}
			<Suspense fallback={<PageLoading />}>
				<SOPLibraryList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
