import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingSessionList } from "../components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Sessions");

export const revalidate = 0;

export default async function TrainingSessionsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Training Sessions"
				description="Manage training sessions and schedules"
				searchPlaceholder="Search training sessions..."
				addButtonLabel="Create Session"
				addButtonHref="/training-support/sessions/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "PLANNED", label: "Planned" },
					{ value: "SCHEDULED", label: "Scheduled" },
					{ value: "IN_PROGRESS", label: "In Progress" },
					{ value: "COMPLETED", label: "Completed" },
					{ value: "CANCELLED", label: "Cancelled" },
				]}
				clearHref={search || status !== "ALL" ? "/training-support/sessions" : undefined}
			/>

			<Suspense fallback={<PageLoading />}>
				<TrainingSessionList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
