import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { getTrainingEngagementById } from "@/lib/features/training/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingEngagementRegistrations } from "../../components/training-engagement-registrations";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Registrations");

export const revalidate = 0;

export default async function TrainingEngagementRegistrationsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string; pageSize?: string; search?: string; status?: string; checkIn?: string }> }) {
	const { id } = await params;
	const paramData = await searchParams;
	const page = paramData.page ? parseInt(paramData.page) : 1;
	const pageSize = paramData.pageSize ? parseInt(paramData.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	if (!id) {
		notFound();
	}

	// Get training engagement for breadcrumb
	const engagementResult = await getTrainingEngagementById(id);
	const engagementTitle = engagementResult.success && engagementResult.data ? engagementResult.data.title : `Training ${id}`;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={engagementTitle}
				/>
				<SetBreadcrumb
					segment="registrations"
					label="Registrations"
				/>
				<TrainingEngagementRegistrations
					engagementId={id}
					page={page}
					pageSize={pageSize}
				/>
			</>
		</Suspense>
	);
}
