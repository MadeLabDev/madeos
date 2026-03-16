import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewTrainingEngagementForm } from "./new-training-engagement-form";

export const metadata = generateCrudMetadata("Create Training Engagement");

export default function NewTrainingEngagementPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewTrainingEngagementForm />
		</Suspense>
	);
}
