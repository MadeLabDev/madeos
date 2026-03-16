import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getCategoryAction } from "@/lib/features/knowledge-categories";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CategoryDetailWrapper } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Knowledge Base");

export const revalidate = 0;

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const result = await getCategoryAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const category = result.data as any;

	return (
		<Suspense fallback={<PageLoading />}>
			<CategoryDetailWrapper
				categoryId={id}
				initialCategory={category}
			/>
		</Suspense>
	);
}
