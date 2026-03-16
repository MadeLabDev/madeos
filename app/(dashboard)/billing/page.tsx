import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { BillingContent } from "./components/billing-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Billing");

export const revalidate = 0;

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Billing & Subscription"
				description="Manage your subscription and view billing history"
				searchPlaceholder="Search invoices..."
				search={search}
				clearHref={search ? "/billing" : undefined}
				showSearch={false} // Disable search for now since we don't have search functionality implemented
			/>

			{/* Billing Content */}
			<Suspense fallback={<PageLoading />}>
				<BillingContent
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
