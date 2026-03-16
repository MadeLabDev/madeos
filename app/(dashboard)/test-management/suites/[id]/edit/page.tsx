import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestSuiteById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTestSuiteForm } from "./edit-test-suite-form";

export const metadata = generateCrudMetadata("Test Suites");

export default async function EditTestSuitePage({ params }: { params: Promise<{ id: string }> }) {
	const { id: suiteId } = await params;

	const result = await getTestSuiteById(suiteId);
	if (!result.success || !result.data) {
		notFound();
	}

	const suite = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={suiteId}
					label={suite.name}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTestSuiteForm suiteId={suiteId} />
			</>
		</Suspense>
	);
}
