import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getEngagementByIdAction } from "@/lib/features/customers";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditEngagementForm } from "./edit-engagement-form";

export const metadata = generateCrudMetadata("Engagement");

interface EditEngagementPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditEngagementPage({ params }: EditEngagementPageProps) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	const result = await getEngagementByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const engagement = result.data as any;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={engagement.title}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<Suspense fallback={<PageLoading />}>
				<EditEngagementForm engagement={engagement} />
			</Suspense>
		</>
	);
}
