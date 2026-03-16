import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { SponsorMaterialList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Sponsor Materials");

export const revalidate = 0;

export default async function SponsorMaterialsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Sponsor Materials"
				description="Manage sponsor assets and deliverables for events"
				searchPlaceholder="Search materials..."
				addButtonLabel="Add Material"
				addButtonHref="/marketing/sponsors/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={[
					{ value: "ALL", label: "All Statuses" },
					{ value: "PENDING", label: "Pending" },
					{ value: "SUBMITTED", label: "Submitted" },
					{ value: "APPROVED", label: "Approved" },
					{ value: "REJECTED", label: "Rejected" },
					{ value: "REVISION_REQUESTED", label: "Revision Requested" },
				]}
				clearHref={search || status !== "ALL" ? "/marketing/sponsors" : undefined}
			/>

			{/* Sponsor Material List */}
			<Suspense fallback={<PageLoading />}>
				<SponsorMaterialList
					search={search}
					statusFilter={status}
					page={1}
					pageSize={20}
				/>
			</Suspense>
		</div>
	);
}
