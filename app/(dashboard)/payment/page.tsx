import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { PaymentContent } from "./components/payment-content";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Payment History");

export const revalidate = 0;

export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; status?: string; planId?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const status = params.status;
	const planId = params.planId;

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Payment History"
				description="View your payment transactions and history"
				searchPlaceholder="Search payments..."
				search={search}
				clearHref={search ? "/payment" : undefined}
				showSearch={false} // Disable search for now since we don't have search functionality implemented
			/>

			{/* Payment Content */}
			<Suspense fallback={<PageLoading />}>
				<PaymentContent
					page={page}
					pageSize={pageSize}
					status={status}
					planId={planId}
				/>
			</Suspense>
		</div>
	);
}
