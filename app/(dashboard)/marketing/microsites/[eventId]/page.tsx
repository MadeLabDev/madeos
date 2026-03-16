import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getEventById } from "@/lib/features/events/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventMicrositeDetail } from "../../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const revalidate = 0;

interface EventMicrositeDetailPageProps {
	params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: EventMicrositeDetailPageProps) {
	const { eventId } = await params;
	const eventResult = await getEventById(eventId);
	const eventTitle = eventResult.success ? eventResult.data?.title : eventId;
	return generateCrudMetadata(`Event Microsite - ${eventTitle}`);
}

export default async function EventMicrositeDetailPage({ params }: EventMicrositeDetailPageProps) {
	const { eventId } = await params;

	if (!eventId) {
		notFound();
	}

	const eventResult = await getEventById(eventId);
	const eventTitle = eventResult.success && eventResult.data?.title ? eventResult.data.title : "Unknown Event";

	return (
		<div className="space-y-6">
			<SetBreadcrumb
				segment={eventId}
				label={eventTitle}
			/>

			<Suspense fallback={<PageLoading />}>
				<EventMicrositeDetail eventId={eventId} />
			</Suspense>
		</div>
	);
}
