import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { CreateAssessmentForm } from "./create-assessment-form";

export const metadata = generateCrudMetadata("Create Assessment");

export default function CreateAssessmentPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="new"
					label="Create Assessment"
				/>
				<CreateAssessmentForm />
			</>
		</Suspense>
	);
}
