import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { EventService, RegistrationService } from "@/lib/features/events/services";
import { RegistrationStatus } from "@/lib/features/events/types";
import { requirePermission } from "@/lib/permissions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventAttendees } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Event Attendees");

export const revalidate = 0;

interface AttendeesPageProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		search?: string;
		eventId?: string;
		status?: string;
		checkIn?: string;
	}>;
}

export default async function AttendeesPage({ searchParams }: AttendeesPageProps) {
	await requirePermission("events", "read");

	const params = await searchParams;
	const page = parseInt(params.page || "1");
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");
	const search = params.search || "";
	const eventId = params.eventId || "";
	const status = params.status || "";
	const checkIn = params.checkIn || "";

	const [result, events] = await Promise.all([
		RegistrationService.getRegistrations(
			{
				eventId: eventId || undefined,
				status: status && ["PENDING", "CONFIRMED", "CANCELLED", "CHECKED_IN", "REFUNDED"].includes(status) ? (status as RegistrationStatus) : undefined,
				checkedIn: checkIn ? checkIn === "checked_in" : undefined,
				search: search || undefined,
			},
			{
				skip: (page - 1) * pageSize,
				take: pageSize,
			},
		),
		EventService.getEvents(),
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Event Attendees"
				description="Manage event registrations and attendee check-ins"
				searchPlaceholder="Search by name or email..."
				search={search}
				clearHref={search || eventId || status || checkIn ? "/events/attendees" : undefined}
			/>

			{/* Attendees List */}
			<Suspense fallback={<PageLoading />}>
				<EventAttendees
					initialRegistrations={result.registrations}
					initialEvents={events || []}
					total={result.total}
					page={page}
					pageSize={pageSize}
					search={search}
					eventId={eventId}
					status={status}
					checkIn={checkIn}
				/>
			</Suspense>
		</div>
	);
}
