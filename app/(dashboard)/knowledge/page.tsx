import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { KnowledgeList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; categoryId?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const categoryId = params.categoryId || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Knowledge Base"
				description="Manage knowledge articles and documentation"
				searchPlaceholder="Search by title..."
				addButtonLabel="New Article"
				addButtonHref="/knowledge/new"
				search={search}
				clearHref={search ? "/knowledge" : undefined}
			/>

			{/* Knowledge List */}
			<Suspense fallback={<PageLoading />}>
				<KnowledgeList
					page={page}
					search={search}
					categoryId={categoryId}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
