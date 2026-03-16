import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingEngagementList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Engagements");

export const revalidate = 0;

export default async function TrainingPage({
	searchParams,
}: {
	searchParams: Promise<{
		search?: string;
		status?: string;
		type?: string;
		page?: string;
		pageSize?: string;
	}>;
}) {
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
				title="Training Engagements"
				description="Manage training programs, sessions, and participant progress"
				searchPlaceholder="Search training engagements..."
				addButtonLabel="Create Training Engagement"
				addButtonHref="/training-support/new"
				search={search}
				statusFilter={status}
				typeFilter={type}
				showFilters={true}
				clearHref={search || status !== "ALL" || type !== "ALL" ? "/training-support" : undefined}
			/>

			<Suspense fallback={<PageLoading />}>
				<TrainingEngagementList
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
