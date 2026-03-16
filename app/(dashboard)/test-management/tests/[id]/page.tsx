import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getTestById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestDetail } from "../../components";

export const metadata = generateCrudMetadata("Tests");

export default async function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTestById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	// Test exists, proceed to render component

	return (
		<Suspense fallback={<PageLoading />}>
			<TestDetail testId={id} />
		</Suspense>
	);
}
