import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { RoleList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Roles");

export const revalidate = 0;

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Roles"
				description="Manage system and custom roles with permissions"
				searchPlaceholder="Search by name..."
				addButtonLabel="Add Role"
				addButtonHref="/roles/new"
				search={search}
				clearHref={search ? "/roles" : undefined}
			/>

			{/* Role List */}
			<Suspense fallback={<PageLoading />}>
				<RoleList
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
