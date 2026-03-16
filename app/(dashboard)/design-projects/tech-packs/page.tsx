import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { TechPackStatus } from "@/generated/prisma/enums";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TechPackList } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Tech Packs");

export const revalidate = 0;

const TECH_PACK_STATUSES = [
	{ value: "ALL", label: "All Statuses" },
	{ value: TechPackStatus.DRAFT, label: "Draft" },
	{ value: TechPackStatus.IN_PROGRESS, label: "In Progress" },
	{ value: TechPackStatus.REVIEW, label: "Review" },
	{ value: TechPackStatus.APPROVED, label: "Approved" },
	{ value: TechPackStatus.REJECTED, label: "Rejected" },
	{ value: TechPackStatus.FINALIZED, label: "Finalized" },
	{ value: TechPackStatus.ARCHIVED, label: "Archived" },
];

export default async function TechPacksPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const search = params.search || "";
	const status = params.status || "ALL";
	const page = params.page ? parseInt(params.page) : 1;
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Tech Packs"
				description="Manage manufacturing specifications and production details for approved designs"
				searchPlaceholder="Search tech packs..."
				addButtonLabel="Create Tech Pack"
				addButtonHref="/design-projects/tech-packs/new"
				search={search}
				statusFilter={status}
				showFilters={true}
				statusOptions={TECH_PACK_STATUSES}
				clearHref={search || status !== "ALL" ? "/design-projects/tech-packs" : undefined}
			/>

			{/* Tech Pack List */}
			<Suspense fallback={<PageLoading />}>
				<TechPackList
					search={search}
					statusFilter={status}
					page={page}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
