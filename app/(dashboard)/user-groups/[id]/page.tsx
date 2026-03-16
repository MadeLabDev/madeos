import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getUserGroupAction } from "@/lib/features/user-groups/actions";
import type { UserGroupPageProps } from "@/lib/features/user-groups/types";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { UserGroupDetail } from "../components";

export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("User Group");

export const revalidate = 0;

export default async function UserGroupPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ page?: string; search?: string; pageSize?: string }>;
} & UserGroupPageProps) {
	const { id } = await params;
	const params2 = await searchParams;
	const page = params2.page ? parseInt(params2.page) : 1;
	const search = params2.search || "";
	const pageSize = params2.pageSize ? parseInt(params2.pageSize) : 10;

	const result = await getUserGroupAction(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const userGroup = result.data;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={userGroup.name}
			/>
			<Suspense fallback={<PageLoading />}>
				<UserGroupDetail
					userGroup={userGroup}
					page={page}
					search={search}
					pageSize={pageSize}
				/>
			</Suspense>
		</>
	);
}
