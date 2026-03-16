import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { UserGroupList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("User Groups");

export const revalidate = 0;

export default async function UserGroupsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="User Groups"
				description="Manage user groups and assign users to them"
				searchPlaceholder="Search by group name..."
				addButtonLabel="Create Group"
				addButtonHref="/user-groups/new"
				search={search}
				clearHref={search ? "/user-groups" : undefined}
			/>

			{/* User Group List */}
			<Suspense fallback={<PageLoading />}>
				<UserGroupList
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
