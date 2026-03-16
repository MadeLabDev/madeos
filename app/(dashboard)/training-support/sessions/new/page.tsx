import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { getTrainingEngagementsForSelection } from "@/lib/features/training/actions/training-session.actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTrainingSessionForm } from "./new-training-session-form";

export const metadata = generateCrudMetadata("Create Training Session");

async function loadTrainingEngagementOptions(): Promise<Array<{ value: string; label: string }>> {
	try {
		const result = await getTrainingEngagementsForSelection();
		if (result.success && result.data) {
			return result.data;
		} else {
			console.error("Error loading training engagements:", result.message);
			return [];
		}
	} catch (error) {
		console.error("Error loading training engagements:", error);
		return [];
	}
}

export default async function NewTrainingSessionPage() {
	const trainingEngagementOptions = await loadTrainingEngagementOptions();

	return (
		<Suspense fallback={<PageLoading />}>
			<NewTrainingSessionForm trainingEngagementOptions={trainingEngagementOptions} />
		</Suspense>
	);
}
