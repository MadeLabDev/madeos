import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getTestSuiteById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestSuiteDetail } from "../../components";

export const metadata = generateCrudMetadata("Test Suites");

export default async function TestSuiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: suiteId } = await params;

	const result = await getTestSuiteById(suiteId);
	if (!result.success || !result.data) {
		notFound();
	}

	// Suite exists, proceed to render component

	return (
		<Suspense fallback={<PageLoading />}>
			<TestSuiteDetail suiteId={suiteId} />
		</Suspense>
	);
}
