import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getPostAction } from "@/lib/features/post/actions";
import { getPostSystemModuleTypesAction } from "@/lib/features/post/actions";
import { getAllCategoriesAction } from "@/lib/features/post-categories/actions";
import { getAllTagsAction } from "@/lib/features/post-tags/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";
import { getPostTypeLabels } from "@/lib/utils/metadata";

import { EditPostForm } from "./edit-post-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const labels = getPostTypeLabels(type);

	return generateCrudMetadata(labels.postsTitle);
}

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
	const labels = getPostTypeLabels(type);

	const [postResult, catsResult, tagsResult, moduleTypesResult] = await Promise.all([getPostAction(id), getAllCategoriesAction(type), getAllTagsAction(type), getPostSystemModuleTypesAction(type)]);

	if (!postResult.success || !postResult.data) {
		notFound();
	}

	const post = postResult.data as any;
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
					segment={id}
					label={post.title}
				/>
				<SetBreadcrumb
					segment="edit"
					label={labels.editBreadcrumb}
				/>
				<EditPostForm
					post={post}
					categories={categories}
					tags={tags}
					type={type}
					moduleTypes={moduleTypes}
				/>
			</>
		</Suspense>
	);
}
