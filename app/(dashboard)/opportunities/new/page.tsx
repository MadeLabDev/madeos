import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewOpportunityForm } from "./new-opportunity-form";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Opportunity");

export const revalidate = 0;

export default async function NewOpportunityPage() {
	return (
		<Suspense fallback={<PageLoading />}>
			<NewOpportunityForm />
		</Suspense>
	);
}
