import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TrainingReportsList } from "../../components/training-reports-list";

interface TrainingReportsPageProps {
	params: Promise<{ id: string }>;
}

export const metadata = generateCrudMetadata("Training Reports");

export default async function TrainingReportsPage({ params }: TrainingReportsPageProps) {
	const { id } = await params;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Training Reports</h1>
				<p className="text-muted-foreground">View and manage training reports for this engagement.</p>
			</div>

			<Suspense fallback={<PageLoading />}>
				<TrainingReportsList engagementId={id} />
			</Suspense>
		</div>
	);
}
