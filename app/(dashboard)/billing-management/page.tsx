import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { AdminBillingContent } from "./components/admin-billing-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Billing Management");

export const revalidate = 0;

export default async function AdminBillingPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Billing Management"
				description="System-wide billing overview and subscription management"
				searchPlaceholder="Search by user email or subscription..."
				search={search}
				clearHref={search ? "/billing-management" : undefined}
				showSearch={false} // Disable search for now since we don't have search functionality implemented
			/>

			{/* Admin Billing Content */}
			<Suspense fallback={<PageLoading />}>
				<AdminBillingContent
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
