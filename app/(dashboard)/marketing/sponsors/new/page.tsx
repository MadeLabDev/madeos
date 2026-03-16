import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewSponsorMaterialPageContent } from "./new-sponsor-material-page-content";

interface NewSponsorMaterialPageProps {
	searchParams: Promise<{ eventId?: string }>;
}

export const metadata = generateCrudMetadata("Sponsor Material");

export default async function NewSponsorMaterialPage({ searchParams }: NewSponsorMaterialPageProps) {
	const params = await searchParams;
	const eventId = params.eventId;

	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="New Sponsor"
			/>
			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<NewSponsorMaterialPageContent initialEventId={eventId} />
				</Suspense>
			</div>
		</>
	);
}
