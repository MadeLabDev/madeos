import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { getEventById } from "@/lib/features/events/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventDetail } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Events");

export const revalidate = 0;

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const pageSize = SITE_CONFIG.pagination.getPageSize("pagesize");

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
				<EventDetail
					eventId={id}
					pageSize={pageSize}
				/>
			</>
		</Suspense>
	);
}
