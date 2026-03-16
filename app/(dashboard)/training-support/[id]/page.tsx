import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { getTrainingEngagementById } from "@/lib/features/training/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingEngagementDetail } from "./components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Engagements");

export const revalidate = 0;

export default async function TrainingEngagementPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const pageSize = SITE_CONFIG.pagination.getPageSize("pagesize");

	if (!id) {
		notFound();
	}

	// Get training engagement for breadcrumb
	const engagementResult = await getTrainingEngagementById(id);
	const engagementTitle = engagementResult.success && engagementResult.data ? engagementResult.data.title : `Training Engagement ${id}`;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={engagementTitle}
				/>
				<TrainingEngagementDetail
					engagementId={id}
					pageSize={pageSize}
				/>
			</>
		</Suspense>
	);
}
