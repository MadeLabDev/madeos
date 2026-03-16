import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getTagAction } from "@/lib/features/knowledge-tags";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TagDetailWrapper } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function TagDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getTagAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const tag = result.data as any;

	return (
		<Suspense fallback={<PageLoading />}>
			<TagDetailWrapper
				tagId={id}
				initialTag={tag}
			/>
		</Suspense>
	);
}
