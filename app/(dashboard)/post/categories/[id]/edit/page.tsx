import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getCategoryAction } from "@/lib/features/post-categories";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditCategoryForm } from "./edit-category-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const typeTitle = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;

	return generateCrudMetadata(typeTitle);
}

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
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
					segment="post"
					label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
				/>
				<SetBreadcrumb
					segment="categories"
					label={type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`}
				/>
				<SetBreadcrumb
					segment={id}
					label={(result.data as any).name}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<div className="space-y-6">
					<EditCategoryForm
						category={result.data as any}
						type={type}
					/>
				</div>
			</>
		</Suspense>
	);
}
