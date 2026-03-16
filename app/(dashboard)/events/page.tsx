import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Events");

export const revalidate = 0;

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; type?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const type = params.type || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Events"
				description="Manage events, sessions, and attendee registrations"
				searchPlaceholder="Search events..."
				addButtonLabel="Create Event"
				addButtonHref="/events/new"
				search={search}
				statusFilter={status}
				typeFilter={type}
				showFilters={true}
				clearHref={search || status !== "ALL" || type !== "ALL" ? "/events" : undefined}
			/>

			{/* Event List */}
			<Suspense fallback={<PageLoading />}>
				<EventList
					search={search}
					statusFilter={status}
					typeFilter={type}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
