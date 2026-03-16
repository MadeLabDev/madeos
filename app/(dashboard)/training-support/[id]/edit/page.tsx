import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTrainingEngagementById } from "@/lib/features/training/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTrainingEngagementForm } from "./edit-training-engagement-form";

export const metadata = generateCrudMetadata("Training");

export default async function TrainingEngagementEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	// Get training engagement for breadcrumb
	const engagementResult = await getTrainingEngagementById(id);
	const engagementTitle = engagementResult.success && engagementResult.data ? engagementResult.data.title : `Training ${id}`;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={engagementTitle}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTrainingEngagementForm engagementId={id} />
			</>
		</Suspense>
	);
}
