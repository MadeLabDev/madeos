import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestOrderById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTestOrderForm } from "./edit-test-order-form";

interface EditTestOrderPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditTestOrderPageProps) {
	const { id } = await params;
	return generateCrudMetadata(`Edit Test Order ${id}`);
}

export default async function EditTestOrderPage({ params }: EditTestOrderPageProps) {
	const { id } = await params;

	if (!id) {
		notFound();
	}

	// Get test order for breadcrumb
	const result = await getTestOrderById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const testOrder = result.data;

	return (
		<>
			<SetBreadcrumb
				segment={id}
				label={testOrder.title}
			/>
			<SetBreadcrumb
				segment="edit"
				label="Edit"
			/>
			<Suspense fallback={<PageLoading />}>
				<EditTestOrderForm testOrderId={id} />
			</Suspense>
		</>
	);
}
