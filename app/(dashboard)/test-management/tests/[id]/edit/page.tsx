import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTestForm } from "./edit-test-form";

export const metadata = generateCrudMetadata("Tests");

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTestById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const test = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={test.name}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTestForm testId={id} />
			</>
		</Suspense>
	);
}
