import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTagAction } from "@/lib/features/knowledge-tags";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTagForm } from "./edit-tag-form";

export const metadata = generateCrudMetadata("Knowledge Base");

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
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
			<div className="space-y-6">
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTagForm tag={result.data as any} />
			</div>
		</Suspense>
	);
}
