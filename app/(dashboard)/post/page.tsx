import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata, getPostTypeLabels } from "@/lib/utils/metadata";

import { PostList } from "./components";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const labels = getPostTypeLabels(type);

	return generateCrudMetadata(labels.postsTitle);
}

export default async function PostPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; categoryId?: string; pageSize?: string; type?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const categoryId = params.categoryId || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const type = params.type || "blog";
	const labels = getPostTypeLabels(type);

	// Dynamic title and description based on type
	const typeTitle = labels.formattedType;
	const typeDescription = labels.manageDescription;
	const typeNewHref = `/post/new?type=${type}`;
	const typeClearHref = search ? `/post?type=${type}` : `/post?type=${type}`;

	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment="post"
				label={labels.postsTitle}
			/>

			{/* Header */}
			<ListPageHeader
				title={typeTitle}
				description={typeDescription}
				searchPlaceholder="Search by title..."
				addButtonLabel={`New ${labels.formattedType}`}
				addButtonHref={typeNewHref}
				search={search}
				clearHref={search ? typeClearHref : undefined}
				type={type}
			/>

			{/* Post List */}
			<Suspense fallback={<PageLoading />}>
				<PostList
					page={page}
					search={search}
					categoryId={categoryId}
					pageSize={pageSize}
					type={type}
				/>
			</Suspense>
		</div>
	);
}
