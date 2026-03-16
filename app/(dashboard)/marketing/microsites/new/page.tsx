import { Suspense } from "react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { NewEventMicrositePageContent } from "./new-event-microsite-page-content";

interface NewEventMicrositePageProps {
	searchParams: Promise<{ eventId?: string }>;
}

export const metadata = generateCrudMetadata("Event Microsite");

export default async function NewEventMicrositePage({ searchParams }: NewEventMicrositePageProps) {
	const params = await searchParams;
	const eventId = params.eventId;

	return (
		<>
			<SetBreadcrumb
				segment="new"
				label="New Microsite"
			/>
			<div className="space-y-6">
				<Suspense fallback={<PageLoading />}>
					<NewEventMicrositePageContent initialEventId={eventId} />
				</Suspense>
			</div>
		</>
	);
}
