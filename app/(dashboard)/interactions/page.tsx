import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { InteractionList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Interactions");

export const revalidate = 0;

export default async function InteractionsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; customerId?: string; contactId?: string; type?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const customerId = params.customerId || "";
	const contactId = params.contactId || "";
	const type = params.type || "";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Interactions"
				description="Manage customer communication logs"
				searchPlaceholder="Search by subject, description, or outcome..."
				addButtonLabel="Add Interaction"
				addButtonHref="/interactions/new"
				search={search}
				clearHref={search ? "/interactions" : undefined}
			/>

			{/* Interactions List */}
			<Suspense fallback={<PageLoading />}>
				<InteractionList
					page={page}
					search={search}
					pageSize={pageSize}
					customerId={customerId}
					contactId={contactId}
					type={type}
				/>
			</Suspense>
		</div>
	);
}
