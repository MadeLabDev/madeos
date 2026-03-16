import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { listCategoriesAction } from "@/lib/features/knowledge-categories";

import { CategoryList } from "./components/category-list";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	const result = await listCategoriesAction({
		page,
		pageSize: pageSize,
		search: search || undefined,
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Knowledge Categories"
				description="Manage article categories"
				searchPlaceholder="Search by name or slug..."
				addButtonLabel="New Category"
				addButtonHref="/knowledge/categories/new"
				search={search}
				clearHref={search ? "/knowledge/categories" : undefined}
			/>

			{/* Categories List */}
			<Suspense fallback={<PageLoading />}>
				{result.success && result.data ? (
					<CategoryList
						categories={(result.data as any).data}
						total={(result.data as any).total}
						page={(result.data as any).page}
						pageSize={(result.data as any).limit}
						search={search}
					/>
				) : (
					<div className="py-12 text-center">
						<p className="text-muted-foreground">{result.message || "Failed to load categories"}</p>
					</div>
				)}
			</Suspense>
		</div>
	);
}
