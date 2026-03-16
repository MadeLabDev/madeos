import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestForSuiteForm } from "./new-test-for-suite-form";

export const metadata = generateCrudMetadata("Tests");

interface NewTestForSuitePageProps {
	params: Promise<{ id: string }>;
}

export default async function NewTestForSuitePage({ params }: NewTestForSuitePageProps) {
	const { id: suiteId } = await params;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={suiteId}
					label="Test Suite"
				/>
				<SetBreadcrumb
					segment="tests"
					label="Tests"
				/>
				<SetBreadcrumb
					segment="new"
					label="New Test"
				/>
				<NewTestForSuiteForm suiteId={suiteId} />
			</>
		</Suspense>
	);
}
