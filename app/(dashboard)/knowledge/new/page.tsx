import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getCategoriesAction, getKnowledgeSystemModuleTypesAction, getTagsAction } from "@/lib/features/knowledge/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewKnowledgeForm } from "./new-knowledge-form";

export const metadata = generateCrudMetadata("Knowledge Base");

export default async function NewKnowledgePage() {
	// Get categories, tags, and module types
	const [catsResult, tagsResult, moduleTypesResult] = await Promise.all([getCategoriesAction(), getTagsAction(), getKnowledgeSystemModuleTypesAction("knowledge")]);

	const categories = catsResult.success && catsResult.data ? (catsResult.data as any[]) : [];
	const tags = tagsResult.success && tagsResult.data ? (tagsResult.data as any[]) : [];
	const moduleTypes = moduleTypesResult.success && moduleTypesResult.data ? (moduleTypesResult.data as any[]) : [];

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="Create New Article"
				/>
				<NewKnowledgeForm
					categories={categories}
					tags={tags}
					moduleTypes={moduleTypes}
				/>
			</>
		</Suspense>
	);
}
