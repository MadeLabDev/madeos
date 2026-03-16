import { Suspense } from "react";

import { notFound } from "next/navigation";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { PageLoading } from "@/components/ui/page-loading";
import { getTestOrderById } from "@/lib/features/testing/actions";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { EditTestOrderForm } from "./edit-test-order-form";

export const metadata = generateCrudMetadata("Test Orders");

export default async function EditTestOrderPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const result = await getTestOrderById(id);
	if (!result.success || !result.data) {
		notFound();
	}

	const testOrder = result.data;

	return (
		<Suspense fallback={<PageLoading />}>
			<>
				<SetBreadcrumb
					segment={id}
					label={testOrder.title}
				/>
				<SetBreadcrumb
					segment="edit"
					label="Edit"
				/>
				<EditTestOrderForm testOrderId={id} />
			</>
		</Suspense>
	);
}
