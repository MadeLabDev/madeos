import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getCategoryAction } from "@/lib/features/knowledge-categories";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditCategoryForm } from "./edit-category-form";

export const metadata = generateCrudMetadata("Knowledge Base");

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getCategoryAction(id);

	if (!result.success) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">{result.message || "Category not found"}</p>
			</div>
		);
	}

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<div className="space-y-6">
					<EditCategoryForm category={result.data as any} />
				</div>
			</>
		</Suspense>
	);
}
