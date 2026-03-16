import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { getEventById } from "@/lib/features/events/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventRegistrations } from "../../components/event-registrations";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Event Registrations");

export const revalidate = 0;

export default async function EventRegistrationsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string; pageSize?: string; search?: string; status?: string; checkIn?: string }> }) {
	const { id } = await params;
	const paramData = await searchParams;
	const page = paramData.page ? parseInt(paramData.page) : 1;
	const pageSize = paramData.pageSize ? parseInt(paramData.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

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
					segment="registrations"
					label="Registrations"
				/>
				<EventRegistrations
					eventId={id}
					page={page}
					pageSize={pageSize}
				/>
			</>
		</Suspense>
	);
}
