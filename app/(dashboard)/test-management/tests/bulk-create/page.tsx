import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { BulkTestCreateForm } from "../../components/bulk-test-create-form";

interface BulkTestCreatePageProps {
	searchParams: Promise<{ testOrderId?: string; sampleId?: string }>;
}

export async function generateMetadata() {
	return generateCrudMetadata("Bulk Create Tests");
}

export default async function BulkTestCreatePage({ searchParams }: BulkTestCreatePageProps) {
	const params = await searchParams;
	const { testOrderId, sampleId } = params;

	return (
		<div className="space-y-6">
			<Suspense fallback={<PageLoading />}>
				<BulkTestCreateForm
					testOrderId={testOrderId}
					sampleId={sampleId}
				/>
			</Suspense>
		</div>
	);
}
