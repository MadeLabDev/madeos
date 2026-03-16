import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { AssessmentList, AssessmentListRefresh } from "../components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Assessments");

export const revalidate = 0;

export default async function AssessmentsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; type?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const type = params.type || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Assessments"
				description="Manage training assessments and evaluations"
				searchPlaceholder="Search assessments..."
				addButtonLabel="Create Assessment"
				addButtonHref="/training-support/assessments/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "PENDING", label: "Pending" },
					{ value: "IN_PROGRESS", label: "In Progress" },
					{ value: "COMPLETED", label: "Completed" },
					{ value: "REVIEWED", label: "Reviewed" },
				]}
				clearHref={search || status !== "ALL" || type !== "ALL" ? "/training-support/assessments" : undefined}
			/>

			<AssessmentListRefresh />

			{/* Assessment List */}
			<Suspense fallback={<PageLoading />}>
				<AssessmentList
					search={search}
					statusFilter={status}
					typeFilter={type}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
