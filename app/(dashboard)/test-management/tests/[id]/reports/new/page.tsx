import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewReportForTestForm } from "./new-report-for-test-form";

export const metadata = generateCrudMetadata("Test Reports");

interface NewReportForTestPageProps {
	params: Promise<{ id: string }>;
}

export default async function NewReportForTestPage({ params }: NewReportForTestPageProps) {
	const { id: testId } = await params;

	const result = await getTestById(testId);
	if (!result.success || !result.data) {
		notFound();
	}

	const test = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={testId}
					label={`Test ${test.id}`}
				/>
				<SetBreadcrumb
					segment="reports"
					label="Reports"
				/>
				<SetBreadcrumb
					segment="new"
					label="New Report"
				/>
				<NewReportForTestForm testId={testId} />
			</>
		</Suspense>
	);
}
