import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestForSampleForm } from "./new-test-for-sample-form";

export const metadata = generateCrudMetadata("Tests");

interface NewTestForSamplePageProps {
	params: Promise<{ id: string }>;
}

export default async function NewTestForSamplePage({ params }: NewTestForSamplePageProps) {
	const { id: sampleId } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={sampleId}
					label="Sample"
				/>
				<SetBreadcrumb
					segment="tests"
					label="Tests"
				/>
				<SetBreadcrumb
					segment="new"
					label="New Test"
				/>
				<NewTestForSampleForm sampleId={sampleId} />
			</>
		</Suspense>
	);
}
