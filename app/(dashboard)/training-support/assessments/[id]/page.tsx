import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import type { AssessmentWithRelations } from "@/lib/features/assessments";
import { getAssessmentAction } from "@/lib/features/assessments";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { AssessmentDetail } from "../../components/assessment-detail";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export const metadata = generateCrudMetadata("Assessment Details");

interface AssessmentDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
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
					segment={id}
					label={assessment.title}
				/>
				<AssessmentDetail assessment={assessment} />
			</>
		</Suspense>
	);
}
