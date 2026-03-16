import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EventMicrositeList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Event Microsites");

export const revalidate = 0;

export default async function EventMicrositesPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Event Microsites"
				description="Manage public-facing marketing pages for your events"
				searchPlaceholder="Search microsites..."
				addButtonLabel="Create Microsite"
				addButtonHref="/marketing/microsites/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "PUBLISHED", label: "Published" },
					{ value: "DRAFT", label: "Draft" },
				]}
				clearHref={search || status !== "ALL" ? "/marketing/microsites" : undefined}
			/>

			{/* Event Microsite List */}
			<Suspense fallback={<PageLoading />}>
				<EventMicrositeList
					search={search}
					statusFilter={status}
					page={1}
					pageSize={20}
				/>
			</Suspense>
		</div>
	);
}
