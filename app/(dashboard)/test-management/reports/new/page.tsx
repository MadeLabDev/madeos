import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestReportForm } from "./new-test-report-form";

export const metadata = generateCrudMetadata("Test Reports");

export default function NewTestReportPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Test Report"
				/>
				<NewTestReportForm />
			</>
		</Suspense>
	);
}
