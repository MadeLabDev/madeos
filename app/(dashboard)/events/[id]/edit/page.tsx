import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getEventById } from "@/lib/features/events/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditEventForm } from "./edit-event-form";

export const metadata = generateCrudMetadata("Events");

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	// Get event for breadcrumb
	const eventResult = await getEventById(id);
	const eventTitle = eventResult.success && eventResult.data ? eventResult.data.title : `Event ${id}`;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={eventTitle}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditEventForm eventId={id} />
			</>
		</Suspense>
	);
}
