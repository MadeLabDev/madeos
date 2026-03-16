import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getCategoryAction } from "@/lib/features/post-categories";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CategoryDetailWrapper } from "../components";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const typeTitle = type === "blog" ? "Blog Categories" : `${type.charAt(0).toUpperCase() + type.slice(1)} Categories`;

	return generateCrudMetadata(typeTitle);
}

export default async function CategoryDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
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
				type={type}
			/>
		</Suspense>
	);
}
