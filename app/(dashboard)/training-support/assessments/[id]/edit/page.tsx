import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import type { AssessmentWithRelations } from "@/lib/features/assessments";
import { getAssessmentAction } from "@/lib/features/assessments";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditAssessmentForm } from "./edit-assessment-form";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export const metadata = generateCrudMetadata("Edit Assessment");

interface EditAssessmentPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditAssessmentPage({ params }: EditAssessmentPageProps) {
	const { id } = await params;

	const result = await getAssessmentAction(id);

	if (!result.success || !result.data) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-muted-foreground">Assessment not found</p>
			</div>
		);
	}

	const assessment: AssessmentWithRelations = result.data as AssessmentWithRelations;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment="edit"
					label="Edit Assessment"
				/>
				<EditAssessmentForm assessment={assessment} />
			</>
		</Suspense>
	);
}
