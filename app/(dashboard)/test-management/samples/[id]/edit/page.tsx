import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getSampleById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditSampleForm } from "./edit-sample-form";

export const metadata = generateCrudMetadata("Samples");

export default async function EditSamplePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getSampleById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const sample = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={sample.name}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditSampleForm sampleId={id} />
			</>
		</Suspense>
	);
}
