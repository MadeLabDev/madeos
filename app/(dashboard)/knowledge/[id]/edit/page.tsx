import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getArticleAction, getCategoriesAction, getKnowledgeSystemModuleTypesAction, getTagsAction } from "@/lib/features/knowledge/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditKnowledgeForm } from "./edit-knowledge-form";

export const metadata = generateCrudMetadata("Knowledge Base");

export default async function EditKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const [articleResult, catsResult, tagsResult, moduleTypesResult] = await Promise.all([getArticleAction(id), getCategoriesAction(), getTagsAction(), getKnowledgeSystemModuleTypesAction("knowledge")]);

	if (!articleResult.success || !articleResult.data) {
		notFound();
	}

	const article = articleResult.data as any;
	const categories = catsResult.success && catsResult.data ? (catsResult.data as any[]) : [];
	const tags = tagsResult.success && tagsResult.data ? (tagsResult.data as any[]) : [];
	const moduleTypes = moduleTypesResult.success && moduleTypesResult.data ? (moduleTypesResult.data as any[]) : [];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={article.title}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditKnowledgeForm
					article={article}
					categories={categories}
					tags={tags}
					moduleTypes={moduleTypes}
				/>
			</>
		</Suspense>
	);
}
