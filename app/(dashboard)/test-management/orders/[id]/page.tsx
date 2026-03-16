import { Suspense } from "react";

import { notFound } from "next/navigation";

import { PageLoading } from "@/components/ui/page-loading";
import { getTestOrderById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { TestOrderDetail } from "../../components";

// Force dynamic rendering - prevent automatic revalidation
export const dynamic = "force-dynamic";

export const metadata = generateCrudMetadata("Test Orders");

export const revalidate = 0;

export default async function TestOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTestOrderById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	// Test order exists, proceed to render component

	return (
		<Suspense fallback={<PageLoading />}>
			<TestOrderDetail testOrderId={id} />
		</Suspense>
	);
}
