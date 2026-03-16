import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getSampleById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { SampleDetail } from "../../components";

export const metadata = generateCrudMetadata("Samples");

export default async function SampleDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getSampleById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	// Sample exists, proceed to render component

	return (
		<Suspense fallback={<PageLoading />}>
			<SampleDetail sampleId={id} />
		</Suspense>
	);
}
