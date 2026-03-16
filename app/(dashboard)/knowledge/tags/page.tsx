import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { listTagsAction } from "@/lib/features/knowledge-tags";

import { TagList } from "./components/tag-list";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function TagsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	const result = await listTagsAction({
		page,
		limit: pageSize,
		search: search || undefined,
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Knowledge Tags"
				description="Manage article tags"
				searchPlaceholder="Search by name or slug..."
				addButtonLabel="New Tag"
				addButtonHref="/knowledge/tags/new"
				search={search}
				clearHref={search ? "/knowledge/tags" : undefined}
			/>

			{/* Tags List */}
			<Suspense fallback={<PageLoading />}>
				{result.success && result.data ? (
					<TagList
						tags={(result.data as any).data}
						total={(result.data as any).total}
						page={(result.data as any).page}
						pageSize={(result.data as any).limit}
						search={search}
					/>
				) : (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">{result.message || "Failed to load tags"}</p>
					</div>
				)}
			</Suspense>
		</div>
	);
}
