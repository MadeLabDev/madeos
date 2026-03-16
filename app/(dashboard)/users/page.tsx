import { Suspense } from "react";

import { ListPageHeader } from "@/components/list-page/list-page-header";
import { PageLoading } from "@/components/ui/page-loading";
import { SITE_CONFIG } from "@/lib";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { ResendExpiredActivationButton, UserList } from "./components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Users");

export const revalidate = 0;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; roleId?: string; pageSize?: string }> }) {
	const params = await searchParams;
	const page = params.page ? parseInt(params.page) : 1;
	const search = params.search || "";
	const roleId = params.roleId || "";
	const pageSize = params.pageSize ? parseInt(params.pageSize) : SITE_CONFIG.pagination.getPageSize("pagesize");

	return (
		<div className="space-y-6">
			{/* Header */}
			<ListPageHeader
				title="Users"
				description="Manage user accounts and permissions"
				searchPlaceholder="Search by email or name..."
				addButtonLabel="Add User"
				addButtonHref="/users/new"
				search={search}
				clearHref={search ? "/users" : undefined}
			/>
			<div className="flex w-full flex-row justify-end">
				<ResendExpiredActivationButton />
			</div>

			{/* User List */}
			<Suspense fallback={<PageLoading />}>
				<UserList
					page={page}
					search={search}
					roleId={roleId}
					pageSize={pageSize}
				/>
			</Suspense>
		</div>
	);
}
