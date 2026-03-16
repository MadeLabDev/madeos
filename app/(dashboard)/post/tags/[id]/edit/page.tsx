import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTagAction } from "@/lib/features/post-tags";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTagForm } from "./edit-tag-form";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const typeTitle = type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`;

	return generateCrudMetadata(typeTitle);
}

export default async function EditTagPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
	const result = await getTagAction(id);

	if (!result.success) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">{result.message || "Tag not found"}</p>
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
					segment="tags"
					label={type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`}
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
					<EditTagForm
						tag={result.data as any}
						type={type}
					/>
				</div>
			</>
		</Suspense>
	);
}
