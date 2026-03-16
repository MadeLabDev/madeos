import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { DesignDeckList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Design Decks");

export const revalidate = 0;

export default async function DesignDecksPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			<ListPageHeader
				title="Design Decks"
				description="Create and manage comprehensive design presentations for client reviews."
				searchPlaceholder="Search design decks..."
				addButtonLabel="New Design Deck"
				addButtonHref="/design-projects/design-decks/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "DRAFT", label: "Draft" },
					{ value: "IN_PROGRESS", label: "In Progress" },
					{ value: "REVIEW", label: "Review" },
					{ value: "PUBLISHED", label: "Published" },
					{ value: "ARCHIVED", label: "Archived" },
				]}
				clearHref={search || status ? "/design-projects/design-decks" : undefined}
			/>

			<Suspense fallback={<PageLoading />}>
				<DesignDeckList
					page={page}
					pageSize={pageSize}
					search={search}
					status={status}
				/>
			</Suspense>
		</div>
	);
}
