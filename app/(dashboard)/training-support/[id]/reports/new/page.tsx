import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingReportForm } from "../../../components/training-report-form";

interface NewTrainingReportPageProps {
	params: Promise<{ id: string }>;
}

export const metadata = generateCrudMetadata("Training Report");

export default async function NewTrainingReportPage({ params }: NewTrainingReportPageProps) {
	const { id } = await params;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Create Training Report</h1>
				<p className="text-muted-foreground">Create a comprehensive report for this training engagement.</p>
			</div>

			<Suspense fallback={<PageLoading />}>
				<TrainingReportForm engagementId={id} />
			</Suspense>
		</div>
	);
}
