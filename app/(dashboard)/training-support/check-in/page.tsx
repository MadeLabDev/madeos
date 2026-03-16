import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { requirePermission } from "@/lib/permissions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingCheckIn } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Training Check-in");

export const revalidate = 0;

interface CheckInPageProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		recentPage?: string;
		recentPageSize?: string;
	}>;
}

export default async function CheckInPage({ searchParams }: CheckInPageProps) {
	await requirePermission("training", "read");

	const params = await searchParams;
	const page = parseInt(params.page || "1");
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const recentPage = parseInt(params.recentPage || "1");
	const recentPageSize = params.recentPageSize ? parseInt(params.recentPageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<Suspense fallback={<PageLoading />}>
			<TrainingCheckIn
				page={page}
				pageSize={pageSize}
				recentPage={recentPage}
				recentPageSize={recentPageSize}
			/>
		</Suspense>
	);
}
