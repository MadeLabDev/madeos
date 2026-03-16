import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTagForm } from "./new-tag-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";
	const typeTitle = type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`;

	return generateCrudMetadata(typeTitle);
}

export default async function NewTagPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const params = await searchParams;
	const type = params.type || "blog";

	return (
		<>
			<SetBreadcrumb
				segment="post"
				label={type === "blog" ? "Blog Posts" : `${type.charAt(0).toUpperCase() + type.slice(1)} Posts`}
			/>
			<SetBreadcrumb
				segment="tags"
				label={type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`}
			/>
			<SetBreadcrumb
				segment="new"
				label="Create New Tag"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<NewTagForm type={type} />
				</Suspense>
			</div>
		</>
	);
}
