import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getOpportunityByIdAction } from "@/lib/features/opportunities";
import type { EditOpportunityPageProps } from "@/lib/features/opportunities/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditOpportunityForm } from "./edit-opportunity-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Opportunity");

export const revalidate = 0;

export default async function EditOpportunityPage({ params }: EditOpportunityPageProps) {
	const { id } = await params;
	const result = await getOpportunityByIdAction(id);

	if (!result.success || !result.data) {
		notFound();
	}

	const opportunity = result.data as any;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={opportunity.title}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<div className="space-y-6">
				{/* Form */}
				<Suspense fallback={<PageLoading />}>
					<EditOpportunityForm opportunity={opportunity} />
				</Suspense>
			</div>
		</>
	);
}
