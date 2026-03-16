import { Suspense } from "react";

import { notFound } from "next/navigation";

import { EventMicrositeForm } from "@/app/(dashboard)/marketing/components/event-microsite-form";
import { PageLoading } from "@/components/ui/page-loading";
import { getEventMicrositeByEventIdAction } from "@/lib/features/marketing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

interface EditEventMicrositePageProps {
	params: Promise<{ eventId: string }>;
}

export const metadata = generateCrudMetadata("Event Microsite");

export default async function EditEventMicrositePage({ params }: EditEventMicrositePageProps) {
	const { eventId } = await params;

	const micrositeResult = await getEventMicrositeByEventIdAction(eventId);

	if (!micrositeResult.success || !micrositeResult.data) {
		notFound();
	}

	return (
		<Suspense fallback={<PageLoading />}>
			{micrositeResult.data.event ? (
				<EventMicrositeForm
					event={micrositeResult.data.event}
					microsite={micrositeResult.data}
				/>
			) : (
				<div>Event not found</div>
			)}
		</Suspense>
	);
}
