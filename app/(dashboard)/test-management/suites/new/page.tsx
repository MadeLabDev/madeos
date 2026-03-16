import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTestSuiteForm } from "./new-test-suite-form";

export const metadata = generateCrudMetadata("Test Suites");

export default function NewTestSuitePage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="New Test Suite"
				/>
				<NewTestSuiteForm />
			</>
		</Suspense>
	);
}
