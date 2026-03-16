import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getTagAction } from "@/lib/features/post-tags";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TagDetailWrapper } from "../components";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
	const { type = "blog" } = await searchParams;
	const typeTitle = type === "blog" ? "Blog Tags" : `${type.charAt(0).toUpperCase() + type.slice(1)} Tags`;

	return generateCrudMetadata(typeTitle);
}

export default async function TagDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
	const { id } = await params;
	const { type = "blog" } = await searchParams;
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
				type={type}
			/>
		</Suspense>
	);
}
