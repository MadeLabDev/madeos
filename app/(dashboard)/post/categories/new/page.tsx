import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewCategoryForm } from "./new-category-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const typeTitle = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;

	return generateCrudMetadata(typeTitle);
}

export default async function NewCategoryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";

	return (
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
				segment="new"
				label="Create New Category"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<NewCategoryForm type={type} />
				</Suspense>
			</div>
		</>
	);
}
