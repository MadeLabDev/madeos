import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { listCategoriesAction } from "@/lib/features/post-categories";

import { CategoryList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";
import { generateCrudMetadata } from "@/lib/utils/metadata";

export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const typeTitle = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;

	return generateCrudMetadata(typeTitle);
}

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string; type?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const type = params.type || "blog";

	const result = await listCategoriesAction({
		page,
		pageSize: pageSize,
		search: search || undefined,
		type,
	});

	// Dynamic title and description based on type
	const typeTitle = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;
	const typeDescription = type === "blog" ? "Manage blog post categories" : `Manage ${type} post categories`;
	const typeNewHref = `/post/categories/new?type=${type}`;
	const typeClearHref = search ? `/post/categories?type=${type}` : `/post/categories?type=${type}`;

	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment="post"
				label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
			/>
			<SetBreadcrumb
				segment="categories"
				label={type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`}
			/>

			{/* Header */}
			<ListPageHeader
				title={typeTitle}
				description={typeDescription}
				searchPlaceholder="Search by name..."
				addButtonLabel="New Category"
				addButtonHref={typeNewHref}
				search={search}
				clearHref={search ? typeClearHref : undefined}
				type={type}
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
						type={type}
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
