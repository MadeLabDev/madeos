import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestReportById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTestReportForm } from "./edit-test-report-form";

export const metadata = generateCrudMetadata("Test Reports");

export default async function EditTestReportPage({ params }: { params: Promise<{ id: string }> }) {
	const { id: reportId } = await params;

	const result = await getTestReportById(reportId);
	if (!result.success || !result.data) {
		notFound();
	}

	const report = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={reportId}
					label={report.title}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTestReportForm reportId={reportId} />
			</>
		</Suspense>
	);
}
