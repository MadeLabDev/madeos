import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getUserByIdAction } from "@/lib/features/users/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { UserDetailWrapper } from "../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Users");

export const revalidate = 0;

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getUserByIdAction(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const user = result.data as any;

	return (
		<Suspense fallback={<PageLoading />}>
			<UserDetailWrapper
				userId={id}
				initialUser={user}
			/>
		</Suspense>
	);
}
