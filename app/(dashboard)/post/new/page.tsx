import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getPostSystemModuleTypesAction } from "@/lib/features/post/actions";
import { getAllCategoriesAction } from "@/lib/features/post-categories/actions";
import { getAllTagsAction } from "@/lib/features/post-tags/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";
import { getPostTypeLabels } from "@/lib/utils/metadata";

import { NewPostForm } from "./new-post-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const labels = getPostTypeLabels(type);

	return generateCrudMetadata(labels.postsTitle);
}

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const labels = getPostTypeLabels(type);
	// Get categories, tags, and module type
	const [catsResult, tagsResult, moduleTypesResult] = await Promise.all([getAllCategoriesAction(type), getAllTagsAction(type), getPostSystemModuleTypesAction(type)]);

	const categories = catsResult.success && catsResult.data ? (catsResult.data as any[]) : [];
	const tags = tagsResult.success && tagsResult.data ? (tagsResult.data as any[]) : [];
	const moduleTypes = moduleTypesResult.success && moduleTypesResult.data ? (moduleTypesResult.data as any[]) : [];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="post"
					label={labels.postsTitle}
				/>
				<SetBreadcrumb
					segment="new"
					label={labels.createBreadcrumb}
				/>
				<NewPostForm
					categories={categories}
					tags={tags}
					type={type}
					moduleTypes={moduleTypes}
				/>
			</>
		</Suspense>
	);
}
